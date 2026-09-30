package main

import (
	"context"
	"database/sql"
	_ "embed"
	"fmt"
	"github.com/go-sql-driver/mysql"
	"time"
)

//go:embed schema.sql
var schemaSQL string

func openDatabase(config Config) (*sql.DB, error) {
	driverConfig := mysql.NewConfig()
	driverConfig.User = config.DatabaseUser
	driverConfig.Passwd = config.DatabasePassword
	driverConfig.Net = "tcp"
	driverConfig.Addr = config.DatabaseHost
	driverConfig.ParseTime = true
	driverConfig.Loc = time.UTC
	driverConfig.Timeout = 5 * time.Second
	driverConfig.ReadTimeout = 5 * time.Second
	driverConfig.WriteTimeout = 5 * time.Second
	driverConfig.Params = map[string]string{"charset": "utf8mb4", "time_zone": "'+00:00'"}
	// Only this application's database and table are initialized; existing rows are untouched.
	bootstrap, err := sql.Open("mysql", driverConfig.FormatDSN())
	if err != nil {
		return nil, err
	}
	defer bootstrap.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if _, err := bootstrap.ExecContext(ctx, "CREATE DATABASE IF NOT EXISTS `"+config.DatabaseName+"` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"); err != nil {
		return nil, fmt.Errorf("create application database: %w", err)
	}
	driverConfig.DBName = config.DatabaseName
	db, err := sql.Open("mysql", driverConfig.FormatDSN())
	if err != nil {
		return nil, err
	}
	db.SetConnMaxLifetime(3 * time.Minute)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	if _, err := db.ExecContext(ctx, schemaSQL); err != nil {
		db.Close()
		return nil, fmt.Errorf("initialize letters table: %w", err)
	}
	return db, nil
}
