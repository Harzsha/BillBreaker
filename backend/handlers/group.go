package handlers

import (
	"billbreak-backend/middleware"
	"billbreak-backend/models"
	"billbreak-backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateGroupRequest represents group creation data
type CreateGroupRequest struct {
	Name string `json:"name" binding:"required"`
}

// CreateGroup creates a new expense group
func CreateGroup(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := middleware.GetUserID(c)
		var req CreateGroupRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		if err := utils.ValidateGroupName(req.Name); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		group := models.Group{
			ID:        utils.GenerateID(),
			Name:      req.Name,
			CreatedBy: userID,
		}

		if err := db.Create(&group).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create group"})
			return
		}

		// Add creator as member
		db.Model(&group).Association("Members").Append(&models.User{ID: userID})

		c.JSON(http.StatusCreated, group)
	}
}

// GetUserGroups retrieves all groups for a user
func GetUserGroups(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := middleware.GetUserID(c)
		var groups []models.Group

		if err := db.Joins("JOIN group_members ON groups.id = group_members.group_id").
			Where("group_members.user_id = ?", userID).
			Preload("Members").
			Find(&groups).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch groups"})
			return
		}

		c.JSON(http.StatusOK, groups)
	}
}

// GetGroup retrieves a specific group
func GetGroup(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("groupId")
		var group models.Group

		if err := db.Preload("Members").First(&group, "id = ?", groupID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
			return
		}

		c.JSON(http.StatusOK, group)
	}
}

// UpdateGroupRequest represents group update data
type UpdateGroupRequest struct {
	Name string `json:"name" binding:"required"`
}

// UpdateGroup updates a group
func UpdateGroup(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("groupId")
		var req UpdateGroupRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		if err := utils.ValidateGroupName(req.Name); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := db.Model(&models.Group{}).Where("id = ?", groupID).Update("name", req.Name).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update group"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "group updated"})
	}
}

// DeleteGroup deletes a group
func DeleteGroup(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("groupId")

		if err := db.Delete(&models.Group{}, "id = ?", groupID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete group"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "group deleted"})
	}
}

// AddGroupMemberRequest represents adding a member to a group
type AddGroupMemberRequest struct {
	UserEmail string `json:"user_email" binding:"required"`
}

// AddGroupMember adds a user to a group
func AddGroupMember(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("groupId")
		var req AddGroupMemberRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		// Find user by email
		var user models.User
		if err := db.Where("email = ?", req.UserEmail).First(&user).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		// Add user to group
		var group models.Group
		if err := db.First(&group, "id = ?", groupID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
			return
		}

		if err := db.Model(&group).Association("Members").Append(&user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add member"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "member added"})
	}
}
