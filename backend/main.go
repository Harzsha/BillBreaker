package main

import (
	"billbreak-backend/handlers"
	"billbreak-backend/middleware"
	"billbreak-backend/models"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to database
	dsn := os.Getenv("DATABASE_URL")
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("✅ Database connected")

	// Auto-migrate models
	if err := DB.AutoMigrate(
		&models.User{},
		&models.Group{},
		&models.GroupMember{},
		&models.Expense{},
		&models.Settlement{},
	); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("✅ Database migrations complete")

	// Setup Gin
	r := gin.Default()

	// Enable CORS for frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "BillBreak API is running",
		})
	})

	// API routes
	api := r.Group("/api/v1")

	// Authentication routes (no auth required)
	auth := api.Group("/auth")
	{
		auth.POST("/signup", handlers.Signup(DB))
		auth.POST("/login", handlers.Login(DB))
	}

	// Protected routes (auth required)
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// User management
		protected.GET("/users/me", handlers.GetCurrentUser(DB))
		protected.GET("/users/:userId", handlers.GetUser(DB))
		protected.PUT("/users/:userId", handlers.UpdateUser(DB))

		// Group management
		protected.POST("/groups", handlers.CreateGroup(DB))
		protected.GET("/groups", handlers.GetUserGroups(DB))
		protected.GET("/groups/:groupId", handlers.GetGroup(DB))
		protected.PUT("/groups/:groupId", handlers.UpdateGroup(DB))
		protected.DELETE("/groups/:groupId", handlers.DeleteGroup(DB))
		protected.POST("/groups/:groupId/members", handlers.AddGroupMember(DB))

		// Expense management
		protected.POST("/expenses", handlers.CreateExpense(DB))
		protected.GET("/expenses/:groupId", handlers.GetGroupExpenses(DB))
		protected.PUT("/expenses/:expenseId", handlers.UpdateExpense(DB))
		protected.DELETE("/expenses/:expenseId", handlers.DeleteExpense(DB))
		protected.POST("/expenses/voice", handlers.ProcessVoiceExpense(DB))

		// Balances and settlements
		protected.GET("/balances/:groupId", handlers.GetGroupBalances(DB))
		protected.GET("/settlements/suggestions/:groupId", handlers.GetSettlementSuggestions(DB))
		protected.POST("/settlements", handlers.CreateSettlement(DB))
		protected.GET("/settlements/:groupId", handlers.GetGroupSettlements(DB))
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on http://localhost:%s", port)
	r.Run(":" + port)
}
