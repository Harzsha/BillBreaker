# BillBreaker Backend API Documentation

## Overview

The BillBreaker backend is a RESTful API built with Go, Gin, and PostgreSQL. It provides complete expense management functionality including:

- User authentication with JWT tokens
- Group management for organizing expenses
- Expense tracking with flexible splitting
- Automatic balance calculations
- Settlement transaction suggestions

## Quick Start

### Prerequisites

- Go 1.25.6+
- PostgreSQL database
- `.env` file with configuration

### Setup

1. **Install dependencies:**
   ```bash
   go mod tidy
   ```

2. **Configure environment variables in `.env`:**
   ```properties
   PORT=8080
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-secret-key-here
   ```

3. **Run the server:**
   ```bash
   go run main.go
   ```

The API will be available at `http://localhost:8080`

## Architecture

### Project Structure

```
backend/
├── main.go           # Server setup, routes, database migrations
├── go.mod            # Go module dependencies
├── .env              # Environment configuration
│
├── models/           # Database models
│   ├── user.go       # User model
│   ├── group.go      # Group and GroupMember models
│   ├── expense.go    # Expense and ExpenseSplit models
│   └── settlement.go # Settlement model
│
├── handlers/         # HTTP request handlers
│   ├── auth.go       # Login/Signup handlers
│   ├── user.go       # User management handlers
│   ├── group.go      # Group management handlers
│   ├── expense.go    # Expense management handlers
│   └── balance.go    # Balance calculation handlers
│
├── middleware/       # HTTP middleware
│   └── auth.go       # JWT authentication middleware
│
└── utils/            # Utility functions
    ├── jwt.go        # Token generation and validation
    ├── password.go   # Password hashing and verification
    ├── balance.go    # Balance calculation logic
    └── validators.go # Input validation
```

## Database Models

### User
```go
type User struct {
    ID        string    `gorm:"primaryKey" json:"id"`
    Email     string    `gorm:"uniqueIndex" json:"email"`
    Name      string    `json:"name"`
    Password  string    `json:"-"` // Never exposed in API
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### Group
```go
type Group struct {
    ID        string    `gorm:"primaryKey" json:"id"`
    Name      string    `json:"name"`
    CreatedBy string    `json:"created_by"`
    Members   []User    `gorm:"many2many:group_members;"`
    Expenses  []Expense
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### Expense
```go
type Expense struct {
    ID          string    `gorm:"primaryKey" json:"id"`
    GroupID     string    `json:"group_id"`
    PaidBy      string    `json:"paid_by"`
    Amount      float64   `json:"amount"`
    Category    string    `json:"category"`        // food, transport, etc.
    Description string    `json:"description"`
    Date        time.Time `json:"date"`
    SplitData   []byte    `gorm:"type:jsonb"`     // JSON array of splits
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

### Settlement
```go
type Settlement struct {
    ID        string    `gorm:"primaryKey" json:"id"`
    GroupID   string    `json:"group_id"`
    FromUser  string    `json:"from_user"`        // Who pays
    ToUser    string    `json:"to_user"`          // Who receives
    Amount    float64   `json:"amount"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

## API Endpoints

### Authentication (No Auth Required)

#### Signup
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response: 201 Created
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "token": "eyJhbGc..."
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "token": "eyJhbGc..."
}
```

### User Management (Auth Required)

#### Get Current User
```
GET /api/v1/users/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Get User by ID
```
GET /api/v1/users/:userId
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Update User
```
PUT /api/v1/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith"
}

Response: 200 OK
{
  "message": "user updated"
}
```

### Group Management (Auth Required)

#### Create Group
```
POST /api/v1/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Trip to Bali"
}

Response: 201 Created
{
  "id": "group-uuid",
  "name": "Trip to Bali",
  "created_by": "user-uuid",
  "members": [],
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

#### Get User's Groups
```
GET /api/v1/groups
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "group-uuid",
    "name": "Trip to Bali",
    "created_by": "user-uuid",
    "members": [...],
    "created_at": "2024-01-21T10:30:00Z",
    "updated_at": "2024-01-21T10:30:00Z"
  }
]
```

#### Get Group Details
```
GET /api/v1/groups/:groupId
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "group-uuid",
  "name": "Trip to Bali",
  "created_by": "user-uuid",
  "members": [
    {
      "id": "user-uuid-1",
      "email": "user1@example.com",
      "name": "John Doe"
    },
    {
      "id": "user-uuid-2",
      "email": "user2@example.com",
      "name": "Jane Smith"
    }
  ],
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

#### Update Group
```
PUT /api/v1/groups/:groupId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Group Name"
}

Response: 200 OK
{
  "message": "group updated"
}
```

#### Delete Group
```
DELETE /api/v1/groups/:groupId
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "group deleted"
}
```

#### Add Group Member
```
POST /api/v1/groups/:groupId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_email": "newmember@example.com"
}

Response: 200 OK
{
  "message": "member added"
}
```

### Expense Management (Auth Required)

#### Create Expense
```
POST /api/v1/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "group_id": "group-uuid",
  "amount": 150.00,
  "category": "food",
  "description": "Dinner",
  "date": "2024-01-21",
  "splits": [
    {
      "user_id": "user-uuid-1",
      "amount": 75.00
    },
    {
      "user_id": "user-uuid-2",
      "amount": 75.00
    }
  ]
}

Response: 201 Created
{
  "id": "expense-uuid",
  "group_id": "group-uuid",
  "paid_by": "current-user-uuid",
  "amount": 150.00,
  "category": "food",
  "description": "Dinner",
  "split_data": "[...]",
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

#### Get Group Expenses
```
GET /api/v1/expenses/:groupId
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "expense-uuid",
    "group_id": "group-uuid",
    "paid_by": "user-uuid-1",
    "amount": 150.00,
    "category": "food",
    "description": "Dinner",
    "split_data": "[...]",
    "paid_by_user": {
      "id": "user-uuid-1",
      "email": "user1@example.com",
      "name": "John Doe"
    },
    "created_at": "2024-01-21T10:30:00Z",
    "updated_at": "2024-01-21T10:30:00Z"
  }
]
```

#### Update Expense
```
PUT /api/v1/expenses/:expenseId
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 160.00,
  "category": "food",
  "description": "Dinner updated",
  "splits": [
    {
      "user_id": "user-uuid-1",
      "amount": 80.00
    },
    {
      "user_id": "user-uuid-2",
      "amount": 80.00
    }
  ]
}

Response: 200 OK
{
  "id": "expense-uuid",
  "group_id": "group-uuid",
  "paid_by": "user-uuid-1",
  "amount": 160.00,
  ...
}
```

#### Delete Expense
```
DELETE /api/v1/expenses/:expenseId
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "expense deleted"
}
```

### Balances & Settlements (Auth Required)

#### Get Group Balances
```
GET /api/v1/balances/:groupId
Authorization: Bearer <token>

Response: 200 OK
{
  "balances": [
    {
      "user_id": "user-uuid-1",
      "name": "John Doe",
      "amount": 50.00        // Positive = owed money
    },
    {
      "user_id": "user-uuid-2",
      "name": "Jane Smith",
      "amount": -50.00       // Negative = owes money
    }
  ],
  "settlements": [
    {
      "from": "user-uuid-2",
      "from_name": "Jane Smith",
      "to": "user-uuid-1",
      "to_name": "John Doe",
      "amount": 50.00
    }
  ]
}
```

#### Get Settlement Suggestions
```
GET /api/v1/settlements/suggestions/:groupId
Authorization: Bearer <token>

Response: 200 OK
{
  "settlements": [
    {
      "from": "user-uuid-2",
      "from_name": "Jane Smith",
      "to": "user-uuid-1",
      "to_name": "John Doe",
      "amount": 50.00
    }
  ]
}
```

#### Record Settlement
```
POST /api/v1/settlements
Authorization: Bearer <token>
Content-Type: application/json

{
  "group_id": "group-uuid",
  "from_user": "user-uuid-2",
  "to_user": "user-uuid-1",
  "amount": 50.00
}

Response: 201 Created
{
  "id": "settlement-uuid",
  "group_id": "group-uuid",
  "from_user": "user-uuid-2",
  "to_user": "user-uuid-1",
  "amount": 50.00,
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

#### Get Group Settlements
```
GET /api/v1/settlements/:groupId
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "settlement-uuid",
    "group_id": "group-uuid",
    "from_user": "user-uuid-2",
    "to_user": "user-uuid-1",
    "amount": 50.00,
    "from_user_data": {
      "id": "user-uuid-2",
      "email": "user2@example.com",
      "name": "Jane Smith"
    },
    "to_user_data": {
      "id": "user-uuid-1",
      "email": "user1@example.com",
      "name": "John Doe"
    },
    "created_at": "2024-01-21T10:30:00Z",
    "updated_at": "2024-01-21T10:30:00Z"
  }
]
```

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

The token is obtained from signup or login and is valid for 24 hours.

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (e.g., email in use)
- `500 Internal Server Error` - Server error

Error responses include a JSON body with an error message:

```json
{
  "error": "description of error"
}
```

## Key Features

### Balance Calculation

The balance calculation algorithm:

1. Sums all expenses in a group
2. For each expense, credits the payer and debits the split recipients
3. Returns net balance per user (positive = owed, negative = owes)

### Settlement Minimization

The settlement algorithm minimizes the number of transactions needed to settle all debts by:

1. Calculating net balance for each user
2. Matching users with highest debt to users with highest credit
3. Creating settlement transactions incrementally

### Password Security

- Passwords are hashed using bcrypt with default cost
- Never stored or returned in plaintext
- Verified using secure comparison

### JWT Tokens

- 24-hour expiration
- Contains user ID, email, and name
- Signed with HS256 algorithm
- Verified on every protected endpoint

## Development

### Dependencies

Key Go packages used:

- `github.com/gin-gonic/gin` - Web framework
- `gorm.io/gorm` - ORM
- `gorm.io/driver/postgres` - PostgreSQL driver
- `github.com/golang-jwt/jwt/v5` - JWT handling
- `golang.org/x/crypto` - Password hashing
- `github.com/google/uuid` - UUID generation

### Database Migrations

Models are automatically migrated on startup using GORM's `AutoMigrate`:

```go
DB.AutoMigrate(
    &models.User{},
    &models.Group{},
    &models.GroupMember{},
    &models.Expense{},
    &models.Settlement{},
)
```

## Environment Variables

```properties
PORT=8080                                          # API port
DATABASE_URL=postgresql://...                      # PostgreSQL connection string
JWT_SECRET=your-super-secret-key-here             # JWT signing secret (change in production!)
```

## Testing

### Test Signup/Login Flow

```bash
# Signup
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Protected Endpoint

```bash
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <token>"
```

## Deployment

### Production Checklist

- [ ] Update `JWT_SECRET` to a strong, randomly generated value
- [ ] Use HTTPS for all connections
- [ ] Enable CORS appropriately (currently allows all origins)
- [ ] Set up database backups
- [ ] Enable database connection pooling
- [ ] Set up monitoring and logging
- [ ] Use environment variables for all secrets
- [ ] Test all endpoints thoroughly

### Docker Deployment

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM golang:1.25.6-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o billbreak-api main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/billbreak-api .
EXPOSE 8080
CMD ["./billbreak-api"]
```

Build and run:

```bash
docker build -t billbreak-api .
docker run -p 8080:8080 --env-file .env billbreak-api
```

## Future Enhancements

- [ ] Voice expense processing with AI
- [ ] Real-time updates with WebSockets
- [ ] Offline sync and conflict resolution
- [ ] Multiple payment methods
- [ ] Expense history and analytics
- [ ] User search and invitations
- [ ] Push notifications
- [ ] More flexible splitting options
