package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"regexp"
)

type Config struct {
	DatabaseHost     string `json:"databaseHost"`
	DatabaseUser     string `json:"databaseUser"`
	DatabasePassword string `json:"databasePassword"`
	DatabaseName     string `json:"databaseName"`
	Port             string `json:"port"`
	StaticDir        string `json:"staticDir"`
}

func loadConfig() (Config, error) {
	config := Config{DatabaseHost: "127.0.0.1:3306", DatabaseUser: "root", DatabaseName: "violet_garden", Port: "8081", StaticDir: "../dist"}
	// Local credentials stay out of source control; environment values take precedence.
	data, err := os.ReadFile("config.local.json")
	if err == nil {
		if err := json.Unmarshal(data, &config); err != nil {
			return config, fmt.Errorf("read config.local.json: %w", err)
		}
	} else if !errors.Is(err, os.ErrNotExist) {
		return config, err
	}
	for name, target := range map[string]*string{
		"DB_HOST": &config.DatabaseHost, "DB_USER": &config.DatabaseUser,
		"DB_PASSWORD": &config.DatabasePassword, "DB_NAME": &config.DatabaseName,
		"PORT": &config.Port, "STATIC_DIR": &config.StaticDir,
	} {
		if value, exists := os.LookupEnv(name); exists {
			*target = value
		}
	}
	if !regexp.MustCompile(`^[a-zA-Z0-9_]{1,64}$`).MatchString(config.DatabaseName) {
		return config, errors.New("DB_NAME must contain only letters, numbers, or underscores")
	}
	if config.DatabasePassword == "" {
		return config, errors.New("set DB_PASSWORD or databasePassword in config.local.json")
	}
	return config, nil
}
