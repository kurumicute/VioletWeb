package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"
)

const lettersPerPage = 9

type LetterInput struct {
	SubmissionID string `json:"submissionId"`
	Title        string `json:"title"`
	Sender       string `json:"sender"`
	Recipient    string `json:"recipient"`
	Body         string `json:"body"`
	IsPublic     bool   `json:"isPublic"`
}

type Letter struct {
	ID        int64     `json:"id"`
	Title     string    `json:"title"`
	Sender    string    `json:"sender"`
	Recipient string    `json:"recipient"`
	Body      string    `json:"body"`
	IsPublic  bool      `json:"isPublic"`
	CreatedAt time.Time `json:"createdAt"`
}

type LetterPage struct {
	Letters    []Letter `json:"letters"`
	NextCursor int64    `json:"nextCursor"`
}

type LetterStore interface {
	Save(context.Context, LetterInput) (int64, error)
	ListPublic(context.Context, int64) (LetterPage, error)
}

type MySQLLetterStore struct{ db *sql.DB }

var submissionIDPattern = regexp.MustCompile(`^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$`)
var errSubmissionConflict = errors.New("submission ID already belongs to different content")

func (input *LetterInput) validate() error {
	input.Title = strings.TrimSpace(input.Title)
	input.Sender = strings.TrimSpace(input.Sender)
	input.Recipient = strings.TrimSpace(input.Recipient)
	input.Body = strings.TrimSpace(input.Body)
	if !submissionIDPattern.MatchString(input.SubmissionID) {
		return errors.New("信件識別碼無效，請重新開啟寫信視窗。")
	}
	for _, field := range []struct {
		name  string
		value string
		limit int
	}{
		{"標題", input.Title, 120}, {"署名", input.Sender, 80},
		{"收信人", input.Recipient, 80}, {"信件內容", input.Body, 10000},
	} {
		if !utf8.ValidString(field.value) || strings.ContainsRune(field.value, '\x00') {
			return fmt.Errorf("%s含有無效字元。", field.name)
		}
		length := utf8.RuneCountInString(field.value)
		if length == 0 || length > field.limit {
			return fmt.Errorf("%s請填寫 1 至 %d 個字。", field.name, field.limit)
		}
	}
	return nil
}

func (store MySQLLetterStore) Save(ctx context.Context, input LetterInput) (int64, error) {
	// Retrying after a network failure must not publish the same letter twice.
	_, err := store.db.ExecContext(ctx, `
  INSERT INTO letters (submission_id, title, sender, recipient, body, is_public)
  VALUES (?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE id = id`,
		input.SubmissionID, input.Title, input.Sender, input.Recipient, input.Body, input.IsPublic,
	)
	if err != nil {
		return 0, err
	}
	var saved Letter
	err = store.db.QueryRowContext(ctx, `
  SELECT id, title, sender, recipient, body, is_public FROM letters WHERE submission_id = ?`, input.SubmissionID,
	).Scan(&saved.ID, &saved.Title, &saved.Sender, &saved.Recipient, &saved.Body, &saved.IsPublic)
	if err != nil {
		return 0, err
	}
	if saved.Title != input.Title || saved.Sender != input.Sender || saved.Recipient != input.Recipient || saved.Body != input.Body || saved.IsPublic != input.IsPublic {
		return 0, errSubmissionConflict
	}
	return saved.ID, nil
}

func (store MySQLLetterStore) ListPublic(ctx context.Context, before int64) (LetterPage, error) {
	page := LetterPage{Letters: make([]Letter, 0, lettersPerPage)}
	query := `SELECT id, title, sender, recipient, body, is_public, created_at FROM letters WHERE is_public = TRUE`
	args := []any{}
	if before > 0 {
		query += " AND id < ?"
		args = append(args, before)
	}
	query += " ORDER BY id DESC LIMIT ?"
	args = append(args, lettersPerPage+1)
	rows, err := store.db.QueryContext(ctx, query, args...)
	if err != nil {
		return page, err
	}
	defer rows.Close()
	for rows.Next() {
		var letter Letter
		if err := rows.Scan(&letter.ID, &letter.Title, &letter.Sender, &letter.Recipient, &letter.Body, &letter.IsPublic, &letter.CreatedAt); err != nil {
			return page, err
		}
		page.Letters = append(page.Letters, letter)
	}
	if err := rows.Err(); err != nil {
		return page, err
	}
	if len(page.Letters) > lettersPerPage {
		page.Letters = page.Letters[:lettersPerPage]
		page.NextCursor = page.Letters[lettersPerPage-1].ID
	}
	return page, nil
}
