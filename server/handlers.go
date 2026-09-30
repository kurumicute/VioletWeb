package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"mime"
	"net/http"
	"strconv"
	"time"
)

type LetterHandler struct{ store LetterStore }

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("write JSON response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func (handler LetterHandler) create(w http.ResponseWriter, r *http.Request) {
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || mediaType != "application/json" {
		writeError(w, http.StatusUnsupportedMediaType, "請使用 JSON 格式提交信件。")
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 128*1024)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	var input LetterInput
	if err := decoder.Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "信件格式不正確，或內容超出大小限制。")
		return
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		writeError(w, http.StatusBadRequest, "請只提交一封信件。")
		return
	}
	if err := input.validate(); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	id, err := handler.store.Save(ctx, input)
	if errors.Is(err, errSubmissionConflict) {
		writeError(w, http.StatusConflict, "這封信已儲存。若要修改內容，請另寫一封。")
		return
	}
	if err != nil {
		log.Printf("save letter: %v", err)
		writeError(w, http.StatusServiceUnavailable, "暫時無法儲存信件，內容已保留在畫面中，請稍後重試。")
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	writeJSON(w, http.StatusCreated, map[string]any{"id": id, "isPublic": input.IsPublic})
}

func (handler LetterHandler) list(w http.ResponseWriter, r *http.Request) {
	var cursor int64
	if value := r.URL.Query().Get("before"); value != "" {
		parsed, err := strconv.ParseInt(value, 10, 64)
		if err != nil || parsed < 1 {
			writeError(w, http.StatusBadRequest, "分頁位置無效。")
			return
		}
		cursor = parsed
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	page, err := handler.store.ListPublic(ctx, cursor)
	if err != nil {
		log.Printf("list letters: %v", err)
		writeError(w, http.StatusServiceUnavailable, "暫時無法載入信件，請稍後再試。")
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	writeJSON(w, http.StatusOK, page)
}
