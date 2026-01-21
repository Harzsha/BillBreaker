package handlers

import (
	"billbreak-backend/middleware"
	"billbreak-backend/models"
	"billbreak-backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetCurrentUserResponse returns current user data
type GetCurrentUserResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

// GetCurrentUser retrieves the authenticated user
func GetCurrentUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := middleware.GetUserID(c)
		var user models.User

		if err := db.First(&user, "id = ?", userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		c.JSON(http.StatusOK, GetCurrentUserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
		})
	}
}

// GetUser retrieves a specific user by ID
func GetUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("userId")
		var user models.User

		if err := db.First(&user, "id = ?", userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		c.JSON(http.StatusOK, GetCurrentUserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
		})
	}
}

// UpdateUserRequest represents user update data
type UpdateUserRequest struct {
	Name string `json:"name" binding:"required"`
}

// UpdateUser updates a user's profile
func UpdateUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("userId")
		var req UpdateUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		if err := utils.ValidateName(req.Name); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := db.Model(&models.User{}).Where("id = ?", userID).Update("name", req.Name).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "user updated"})
	}
}
