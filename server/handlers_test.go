package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type fakeLetterStore struct {
	input     LetterInput
	cursor    int64
	saveError error
}

func (store *fakeLetterStore) Save(_ context.Context, input LetterInput) (int64, error) {
	store.input = input
	return 42, store.saveError
}

func (store *fakeLetterStore) ListPublic(_ context.Context, before int64) (LetterPage, error) {
	store.cursor = before
	return LetterPage{Letters: []Letter{}}, nil
}

func validLetter() LetterInput {
	return LetterInput{
		SubmissionID: "c182f119-f480-4ddf-ae65-a31618054333",
		Title:        "給未來的自己", Sender: "旅人", Recipient: "親愛的你",
		Body: "願你永遠記得\n花園裡的溫柔 💜",
	}
}

func TestCreateLetterValidation(t *testing.T) {
	tests := []struct {
		name   string
		edit   func(*LetterInput)
		status int
	}{
		{"private by default", func(input *LetterInput) {}, http.StatusCreated},
		{"explicit public", func(input *LetterInput) { input.IsPublic = true }, http.StatusCreated},
		{"blank title", func(input *LetterInput) { input.Title = "  \n " }, http.StatusBadRequest},
		{"long body", func(input *LetterInput) { input.Body = strings.Repeat("愛", 10001) }, http.StatusBadRequest},
		{"unicode length boundary", func(input *LetterInput) { input.Title = strings.Repeat("花", 120) }, http.StatusCreated},
		{"invalid submission", func(input *LetterInput) { input.SubmissionID = "bad" }, http.StatusBadRequest},
		{"empty sender", func(input *LetterInput) { input.Sender = "" }, http.StatusBadRequest},
		{"null character", func(input *LetterInput) { input.Body = "hello\x00" }, http.StatusBadRequest},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			input := validLetter()
			test.edit(&input)
			body, _ := json.Marshal(input)
			request := httptest.NewRequest(http.MethodPost, "/api/letters", strings.NewReader(string(body)))
			request.Header.Set("Content-Type", "application/json")
			response := httptest.NewRecorder()
			store := &fakeLetterStore{}
			LetterHandler{store: store}.create(response, request)
			if response.Code != test.status {
				t.Fatalf("status = %d, want %d: %s", response.Code, test.status, response.Body)
			}
			if test.status == http.StatusCreated && store.input.IsPublic != input.IsPublic {
				t.Fatal("visibility was changed")
			}
			if test.status != http.StatusCreated && store.input.SubmissionID != "" {
				t.Fatal("invalid letter reached the database")
			}
		})
	}
}

func TestCreateLetterFailures(t *testing.T) {
	body, _ := json.Marshal(validLetter())
	tests := []struct {
		name, body, contentType string
		storeError              error
		status                  int
	}{
		{"database offline", string(body), "application/json", errors.New("private database detail"), 503},
		{"conflicting retry", string(body), "application/json", errSubmissionConflict, 409},
		{"multiple objects", string(body) + string(body), "application/json", nil, 400},
		{"unknown field", `{"unexpected": true}`, "application/json", nil, 400},
		{"oversized request", `{"body":"` + strings.Repeat("x", 140000) + `"}`, "application/json", nil, 400},
		{"plain text rejected", string(body), "text/plain", nil, 415},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/api/letters", strings.NewReader(test.body))
			request.Header.Set("Content-Type", test.contentType)
			response := httptest.NewRecorder()
			LetterHandler{store: &fakeLetterStore{saveError: test.storeError}}.create(response, request)
			if response.Code != test.status {
				t.Fatalf("status = %d, want %d", response.Code, test.status)
			}
			if strings.Contains(response.Body.String(), "private database detail") {
				t.Fatal("database details leaked")
			}
		})
	}
}

func TestLetterPagination(t *testing.T) {
	for _, test := range []struct {
		query  string
		status int
		cursor int64
	}{
		{"", 200, 0}, {"?before=25", 200, 25}, {"?before=-1", 400, 0}, {"?before=abc", 400, 0},
	} {
		store := &fakeLetterStore{}
		response := httptest.NewRecorder()
		LetterHandler{store: store}.list(response, httptest.NewRequest(http.MethodGet, "/api/letters"+test.query, nil))
		if response.Code != test.status || store.cursor != test.cursor {
			t.Fatalf("unexpected result for %s: %d, %d", test.query, response.Code, store.cursor)
		}
		if test.status == 200 && !strings.Contains(response.Body.String(), `"letters":[]`) {
			t.Fatal("empty feed must serialize as an array")
		}
	}
}
