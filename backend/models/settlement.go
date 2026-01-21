package models

import (
	"time"
)

type Settlement struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	GroupID   string    `json:"group_id"`
	FromUser  string    `json:"from_user"` // User who pays
	ToUser    string    `json:"to_user"`   // User who receives
	Amount    float64   `json:"amount"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	Group        Group `gorm:"foreignKey:GroupID;references:ID" json:"-"`
	FromUserData *User `gorm:"foreignKey:FromUser;references:ID" json:"from_user_data,omitempty"`
	ToUserData   *User `gorm:"foreignKey:ToUser;references:ID" json:"to_user_data,omitempty"`
}

// TableName specifies the table name for GORM
func (Settlement) TableName() string {
	return "settlements"
}
