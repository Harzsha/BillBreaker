package models

import (
	"time"
)

type Group struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	Members       []User    `gorm:"many2many:group_members;" json:"members,omitempty"`
	Expenses      []Expense `json:"expenses,omitempty"`
	CreatedByUser *User     `gorm:"foreignKey:CreatedBy;references:ID" json:"created_by_user,omitempty"`
}

type GroupMember struct {
	GroupID  string    `gorm:"primaryKey" json:"group_id"`
	UserID   string    `gorm:"primaryKey" json:"user_id"`
	JoinedAt time.Time `json:"joined_at"`
	Group    Group     `gorm:"foreignKey:GroupID" json:"-"`
	User     User      `gorm:"foreignKey:UserID" json:"-"`
}

// TableName specifies the table name for GORM
func (Group) TableName() string {
	return "groups"
}

func (GroupMember) TableName() string {
	return "group_members"
}
