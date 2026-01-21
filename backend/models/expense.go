package models

import (
	"encoding/json"
	"time"
)

type Expense struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	GroupID     string    `json:"group_id"`
	PaidBy      string    `json:"paid_by"`
	Amount      float64   `json:"amount"`
	Category    string    `json:"category"` // food, transport, entertainment, utilities, shopping, other
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	SplitData   []byte    `gorm:"type:jsonb" json:"split_data"` // JSON storing split information
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Group      Group `gorm:"foreignKey:GroupID;references:ID" json:"-"`
	PaidByUser *User `gorm:"foreignKey:PaidBy;references:ID" json:"paid_by_user,omitempty"`
}

type ExpenseSplit struct {
	UserID string  `json:"user_id"`
	Amount float64 `json:"amount"`
}

// TableName specifies the table name for GORM
func (Expense) TableName() string {
	return "expenses"
}

// GetSplits parses the split data JSON
func (e *Expense) GetSplits() ([]ExpenseSplit, error) {
	var splits []ExpenseSplit
	if err := json.Unmarshal(e.SplitData, &splits); err != nil {
		return nil, err
	}
	return splits, nil
}

// SetSplits encodes splits to JSON
func (e *Expense) SetSplits(splits []ExpenseSplit) error {
	data, err := json.Marshal(splits)
	if err != nil {
		return err
	}
	e.SplitData = data
	return nil
}
