package main

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"
)

func TestMySQLLetterPersistence(t *testing.T) {
	if os.Getenv("RUN_MYSQL_TESTS") != "1" {
		t.Skip("set RUN_MYSQL_TESTS=1 to test the local MySQL database")
	}
	config, err := loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	// Use a uniquely named test database; never delete rows from the user's database.
	config.DatabaseName = fmt.Sprintf("violet_garden_test_%d", time.Now().UnixNano())
	db, err := openDatabase(config)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	defer func() {
		if _, err := db.Exec("DROP DATABASE `" + config.DatabaseName + "`"); err != nil {
			t.Errorf("clean up test database: %v", err)
		}
	}()
	store := MySQLLetterStore{db: db}
	ctx := context.Background()
	private := validLetter()
	privateID, err := store.Save(ctx, private)
	if err != nil {
		t.Fatal(err)
	}
	public := validLetter()
	public.SubmissionID = "c182f119-f480-4ddf-ae65-a31618054334"
	public.IsPublic = true
	public.Body += "\n'); DROP TABLE letters; --\n<script>alert('test')</script>"
	publicID, err := store.Save(ctx, public)
	if err != nil {
		t.Fatal(err)
	}
	retryID, err := store.Save(ctx, public)
	if err != nil || retryID != publicID {
		t.Fatalf("retry created duplicate: %d %v", retryID, err)
	}
	changed := public
	changed.Body = "changed body"
	if _, err := store.Save(ctx, changed); err != errSubmissionConflict {
		t.Fatalf("conflicting retry = %v", err)
	}
	page, err := store.ListPublic(ctx, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(page.Letters) != 1 || page.Letters[0].ID == privateID || page.Letters[0].Body != public.Body {
		t.Fatalf("public feed or UTF-8 roundtrip incorrect: %+v", page)
	}
	// Reconnect to prove the letter survives beyond a single connection pool.
	secondDB, err := openDatabase(config)
	if err != nil {
		t.Fatal(err)
	}
	defer secondDB.Close()
	if page, err := (MySQLLetterStore{db: secondDB}).ListPublic(ctx, 0); err != nil || len(page.Letters) != 1 {
		t.Fatalf("persistence after reconnect: %v", err)
	}
	for index := 0; index < 10; index++ {
		input := public
		input.SubmissionID = fmt.Sprintf("c182f119-f480-4ddf-ae65-%012d", index)
		if _, err := store.Save(ctx, input); err != nil {
			t.Fatal(err)
		}
	}
	firstPage, err := store.ListPublic(ctx, 0)
	if err != nil || len(firstPage.Letters) != 9 || firstPage.NextCursor == 0 {
		t.Fatalf("first page: %+v %v", firstPage, err)
	}
	lastPage, err := store.ListPublic(ctx, firstPage.NextCursor)
	if err != nil || len(lastPage.Letters) != 2 || lastPage.NextCursor != 0 {
		t.Fatalf("last page: %+v %v", lastPage, err)
	}
	for _, letter := range lastPage.Letters {
		if letter.ID >= firstPage.NextCursor {
			t.Fatal("pagination repeated a letter")
		}
	}
}
