package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func routes(db *sql.DB, staticDir string) http.Handler {
	mux := http.NewServeMux()
	letters := LetterHandler{store: MySQLLetterStore{db: db}}
	mux.HandleFunc("POST /api/letters", letters.create)
	mux.HandleFunc("GET /api/letters", letters.list)
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()
		if err := db.PingContext(ctx); err != nil {
			writeError(w, http.StatusServiceUnavailable, "資料庫連線暫時不可用。")
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "database": "connected"})
	})
	mux.HandleFunc("GET /api/quotes", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, []string{
			"想傳達的心意，一定會有人為你送達。", "有些心情，只有寫成信才能好好說出口。", "讓思念成為文字，讓文字跨越距離。",
		})
	})
	mux.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		writeError(w, http.StatusNotFound, "找不到這個 API。")
	})
	mux.Handle("/", http.FileServer(http.Dir(staticDir)))
	return mux
}

func run() error {
	config, err := loadConfig()
	if err != nil {
		return err
	}
	db, err := openDatabase(config)
	if err != nil {
		return err
	}
	defer db.Close()
	server := &http.Server{
		Addr: ":" + config.Port, Handler: routes(db, config.StaticDir),
		ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second,
		WriteTimeout: 15 * time.Second, IdleTimeout: 60 * time.Second,
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("shutdown: %v", err)
		}
	}()
	log.Printf("Violet Garden: http://localhost:%s (MySQL connected)", config.Port)
	if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
