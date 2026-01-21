package handlers

import (
	"billbreak-backend/middleware"
	"billbreak-backend/models"
	"billbreak-backend/utils"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateExpenseRequest represents expense creation data
type CreateExpenseRequest struct {
	GroupID     string                `json:"group_id" binding:"required"`
	Amount      float64               `json:"amount" binding:"required"`
	Category    string                `json:"category" binding:"required"`
	Description string                `json:"description"`
	Date        string                `json:"date"`
	Splits      []models.ExpenseSplit `json:"splits" binding:"required"`
}

// CreateExpense creates a new expense
func CreateExpense(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := middleware.GetUserID(c)
		var req CreateExpenseRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		// Create expense
		expense := models.Expense{
			ID:          utils.GenerateID(),
			GroupID:     req.GroupID,
			PaidBy:      userID,
			Amount:      req.Amount,
			Category:    req.Category,
			Description: req.Description,
		}

		// Set splits
		if err := expense.SetSplits(req.Splits); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid splits"})
			return
		}

		if err := db.Create(&expense).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create expense"})
			return
		}

		c.JSON(http.StatusCreated, expense)
	}
}

// GetGroupExpenses retrieves all expenses for a group
func GetGroupExpenses(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("groupId")
		var expenses []models.Expense

		if err := db.Where("group_id = ?", groupID).
			Preload("PaidByUser").
			Order("date DESC").
			Find(&expenses).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch expenses"})
			return
		}

		c.JSON(http.StatusOK, expenses)
	}
}

// UpdateExpenseRequest represents expense update data
type UpdateExpenseRequest struct {
	Amount      float64               `json:"amount" binding:"required"`
	Category    string                `json:"category" binding:"required"`
	Description string                `json:"description"`
	Splits      []models.ExpenseSplit `json:"splits" binding:"required"`
}

// UpdateExpense updates an expense
func UpdateExpense(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		expenseID := c.Param("expenseId")
		var req UpdateExpenseRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		var expense models.Expense
		if err := db.First(&expense, "id = ?", expenseID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "expense not found"})
			return
		}

		// Update fields
		expense.Amount = req.Amount
		expense.Category = req.Category
		expense.Description = req.Description

		// Set new splits
		if err := expense.SetSplits(req.Splits); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid splits"})
			return
		}

		if err := db.Save(&expense).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update expense"})
			return
		}

		c.JSON(http.StatusOK, expense)
	}
}

// DeleteExpense deletes an expense
func DeleteExpense(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		expenseID := c.Param("expenseId")

		if err := db.Delete(&models.Expense{}, "id = ?", expenseID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete expense"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "expense deleted"})
	}
}

// ProcessVoiceExpense processes voice input to create an expense
func ProcessVoiceExpense(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := middleware.GetUserID(c)
		groupID := c.PostForm("group_id")

		if groupID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "group_id is required"})
			return
		}

		// Get uploaded audio file
		file, err := c.FormFile("audio")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "audio file is required"})
			return
		}

		 // Save audio file temporarily
		tempDir := os.TempDir()
		audioPath := filepath.Join(tempDir, file.Filename)
		if err := c.SaveUploadedFile(file, audioPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save audio file"})
			return
		}
		defer os.Remove(audioPath) // Clean up temp file

		// Transcribe audio
		transcribedText, err := utils.TranscribeAudio(audioPath)
		if err != nil {
			// Fallback: try to parse without transcription
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to transcribe audio: " + err.Error()})
			return
		}

		// Parse expense details from transcribed text
		expenseDetails, err := utils.ParseExpenseFromText(transcribedText)
		if err != nil {
			// Fallback to simple parsing
			expenseDetails, err = utils.SimpleParseExpense(transcribedText)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse expense: " + err.Error()})
				return
			}
		}

		 // Create splits for all group members (equal split by default)
		var groupMembers []models.User
		if err := db.Where("id IN (SELECT user_id FROM group_members WHERE group_id = ?)", groupID).
			Find(&groupMembers).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch group members"})
			return
		}

		splitAmount := expenseDetails.Amount / float64(len(groupMembers)+1) // +1 for current user
		splits := []models.ExpenseSplit{
			{
				UserID: userID,
				Amount: splitAmount,
			},
		}

		for _, member := range groupMembers {
			splits = append(splits, models.ExpenseSplit{
				UserID: member.ID,
				Amount: splitAmount,
			})
		}

		// Create expense
		expense := models.Expense{
			ID:          utils.GenerateID(),
			GroupID:     groupID,
			PaidBy:      userID,
			Amount:      expenseDetails.Amount,
			Category:    expenseDetails.Category,
			Description: expenseDetails.Description,
			Date:        time.Now(),
		}

		// Set splits
		if err := expense.SetSplits(splits); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid splits"})
			return
		}

		if err := db.Create(&expense).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create expense"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"success":      true,
			"message":      "Expense created from voice recording",
			"expense":      expense,
			"transcribed":  transcribedText,
			"amount":       expenseDetails.Amount,
			"category":     expenseDetails.Category,
			"description":  expenseDetails.Description,
		})
	}
}
