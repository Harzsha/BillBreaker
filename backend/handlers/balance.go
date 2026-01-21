package handlers

import (
	"billbreak-backend/models"
	"billbreak-backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// BalanceResponse represents balance information
type BalanceResponse struct {
	Balances    []utils.Balance               `json:"balances"`
	Settlements []utils.SettlementTransaction `json:"settlements"`
}

// GetGroupBalances calculates balances for a group
func GetGroupBalances(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("groupId")

		balances, err := utils.CalculateBalances(db, groupID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate balances"})
			return
		}

		settlements := utils.CalculateSettlements(balances)

		c.JSON(http.StatusOK, BalanceResponse{
			Balances:    balances,
			Settlements: settlements,
		})
	}
}

// GetSettlementSuggestions gets suggested settlement transactions
func GetSettlementSuggestions(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("groupId")

		balances, err := utils.CalculateBalances(db, groupID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate balances"})
			return
		}

		settlements := utils.CalculateSettlements(balances)

		c.JSON(http.StatusOK, gin.H{
			"settlements": settlements,
		})
	}
}

// CreateSettlementRequest represents settlement creation data
type CreateSettlementRequest struct {
	GroupID  string  `json:"group_id" binding:"required"`
	FromUser string  `json:"from_user" binding:"required"`
	ToUser   string  `json:"to_user" binding:"required"`
	Amount   float64 `json:"amount" binding:"required"`
}

// CreateSettlement records a settlement payment
func CreateSettlement(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateSettlementRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		settlement := models.Settlement{
			ID:       utils.GenerateID(),
			GroupID:  req.GroupID,
			FromUser: req.FromUser,
			ToUser:   req.ToUser,
			Amount:   req.Amount,
		}

		if err := db.Create(&settlement).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create settlement"})
			return
		}

		c.JSON(http.StatusCreated, settlement)
	}
}

// GetGroupSettlements retrieves all settlements for a group
func GetGroupSettlements(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("groupId")
		var settlements []models.Settlement

		if err := db.Where("group_id = ?", groupID).
			Preload("FromUserData").
			Preload("ToUserData").
			Order("created_at DESC").
			Find(&settlements).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch settlements"})
			return
		}

		c.JSON(http.StatusOK, settlements)
	}
}
