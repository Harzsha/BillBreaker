package models

import (
	"time"
)

type User struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Name      string    `json:"name"`
	Password  string    `json:"-"` // Never expose password
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	Groups   []Group   `gorm:"many2many:group_members;" json:"groups,omitempty"`
	Expenses []Expense `gorm:"foreignKey:PaidBy;references:ID" json:"expenses,omitempty"`
}

// TableName specifies the table name for GORM
func (User) TableName() string {
	return "users"
}
