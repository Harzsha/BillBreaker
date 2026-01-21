package utils

import (
	"errors"
	"os"
	"strings"
)

// ValidateEmail checks if email format is valid
func ValidateEmail(email string) error {
	if email == "" {
		return errors.New("email is required")
	}
	if !strings.Contains(email, "@") {
		return errors.New("invalid email format")
	}
	return nil
}

// ValidatePassword checks if password meets requirements
func ValidatePassword(password string) error {
	if len(password) < 6 {
		return errors.New("password must be at least 6 characters")
	}
	return nil
}

// ValidateName checks if name is valid
func ValidateName(name string) error {
	if strings.TrimSpace(name) == "" {
		return errors.New("name is required")
	}
	return nil
}

// ValidateGroupName checks if group name is valid
func ValidateGroupName(name string) error {
	if strings.TrimSpace(name) == "" {
		return errors.New("group name is required")
	}
	return nil
}

// DeleteFile removes a file from the filesystem
func DeleteFile(filePath string) error {
	return os.Remove(filePath)
}
