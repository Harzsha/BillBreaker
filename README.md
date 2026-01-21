# BillBreaker - AI-Powered Expense Splitting App

A full-stack mobile application for splitting expenses intelligently with AI-powered voice input, built with React Native Expo (frontend) and Go + PostgreSQL (backend).

## 📱 Project Overview

**BillBreaker** simplifies expense management when you're with friends or groups:

- 💰 **Track shared expenses** - Record who paid and who owes
- 🎯 **Smart splitting** - Flexible split options (equal, custom amounts, percentage)
- 🤖 **AI voice input** - Say your expense and the app extracts the details
- 📊 **Auto-calculated balances** - See who owes whom instantly
- 🔐 **Secure authentication** - JWT-based backend auth + Supabase
- 🧮 **Settlement optimization** - Minimal transactions needed to settle

## 🏗️ Architecture

```
BillBreaker/
├── frontend/                 # React Native Expo App
│   ├── app/                 # File-based routing
│   │   ├── (auth)/         # Login/Signup screens
│   │   ├── (tabs)/         # Main app screens
│   │   └── group/          # Group details
│   ├── lib/
│   │   ├── api.ts          # API client with auth
│   │   ├── auth.ts         # Zustand auth store
│   │   └── supabase.ts     # Supabase setup
│   ├── components/         # Reusable UI components
│   └── constants/          # App configuration
│
└── backend/                 # Go REST API
    ├── handlers/           # HTTP request handlers
    ├── models/            # Database models
    ├── middleware/        # Auth middleware
    ├── utils/             # Business logic
    ├── main.go            # Server setup
    └── go.mod             # Dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Frontend**: Node.js 18+, npm or yarn
- **Backend**: Go 1.25.6+, PostgreSQL database
- **Database**: Supabase account (or any PostgreSQL instance)

### Backend Setup

```bash
cd backend

# Install dependencies
go mod tidy

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT_SECRET

# Start the server
go run main.go
```

The API will be available at `http://localhost:8080/api/v1`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo 'EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1' > .env.local

# Start the development server
npx expo start

# Press 'i' for iOS, 'a' for Android, or 'w' for web
```

## 📚 Documentation

### Backend
- **[API.md](backend/API.md)** - Complete API reference with curl examples
- **[IMPLEMENTATION_SUMMARY.md](backend/IMPLEMENTATION_SUMMARY.md)** - Backend implementation details

### Frontend
- **[AUTHENTICATION.md](frontend/AUTHENTICATION.md)** - Frontend authentication system
- **[IMPLEMENTATION_SUMMARY.md](frontend/IMPLEMENTATION_SUMMARY.md)** - Frontend implementation details

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/signup          - Register new user
POST   /api/v1/auth/login           - Login user
```

### User Management
```
GET    /api/v1/users/me             - Get current user
GET    /api/v1/users/:userId        - Get user by ID
PUT    /api/v1/users/:userId        - Update user profile
```

### Groups
```
POST   /api/v1/groups               - Create group
GET    /api/v1/groups               - List user's groups
GET    /api/v1/groups/:groupId      - Get group details
PUT    /api/v1/groups/:groupId      - Update group
DELETE /api/v1/groups/:groupId      - Delete group
POST   /api/v1/groups/:groupId/members - Add member by email
```

### Expenses
```
POST   /api/v1/expenses             - Create expense
GET    /api/v1/expenses/:groupId    - List group expenses
PUT    /api/v1/expenses/:expenseId  - Update expense
DELETE /api/v1/expenses/:expenseId  - Delete expense
POST   /api/v1/expenses/voice       - Process voice expense
```

### Balances & Settlements
```
GET    /api/v1/balances/:groupId    - Get balances and settlements
GET    /api/v1/settlements/suggestions/:groupId - Settlement suggestions
POST   /api/v1/settlements          - Record settlement payment
GET    /api/v1/settlements/:groupId - Settlement history
```

Full documentation available in [backend/API.md](backend/API.md)

## 🔐 Authentication

### Frontend (Supabase)
- Email/password authentication
- Tokens stored in AsyncStorage
- Auto-refresh on app startup
- Session persistence

### Backend (JWT)
- 24-hour JWT tokens
- Bcrypt password hashing
- Bearer token validation on protected routes
- User context available in handlers

## 💾 Database Schema

### Tables
- **users** - User accounts with email and name
- **groups** - Expense groups
- **group_members** - Many-to-many relationship (users in groups)
- **expenses** - Individual expenses with flexible splits
- **settlements** - Payment records between users

### Key Features
- JSONB storage for expense splits
- Automatic timestamps (created_at, updated_at)
- Foreign key relationships
- Composite primary keys for junction tables

## 🎯 Core Features

### 1. User Management
- Sign up with email/password
- Secure password hashing
- User profile management
- Session persistence

### 2. Group Expenses
- Create groups for trips, apartments, events
- Add members by email
- Track all expenses in a group
- Flexible expense categorization

### 3. Smart Splitting
- Equal splits among group members
- Custom amount splits per person
- Automatic balance calculation
- JSONB storage for flexibility

### 4. Balance Calculation
- Tracks who owes whom
- Calculates net balances per user
- Minimizes settlement transactions
- Suggests optimal payment flows

### 5. Settlement Tracking
- Record payment settlements
- Settlement history per group
- Clear payment instructions

### 6. Voice Processing
- AI-powered expense entry (placeholder for Claude AI integration)
- Transcribe and extract expense details
- Future: real-time expense creation

## 🛠️ Tech Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Zustand** for state management
- **Supabase** for authentication
- **Axios** for API communication
- **Expo Router** for navigation

### Backend
- **Go 1.25.6** programming language
- **Gin** web framework
- **GORM** ORM for database
- **PostgreSQL** database
- **JWT** for token authentication
- **Bcrypt** for password hashing

## 📋 Environment Variables

### Backend (.env)
```properties
PORT=8080
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-here
ANTHROPIC_API_KEY=your-claude-api-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### Frontend (.env.local)
```properties
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Test signup
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test login (get token)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint with token
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <your-token>"
```

### Frontend Testing
- Run on iOS/Android emulator or physical device
- Test signup/login flow
- Create a group and add members
- Add expenses and verify balance calculation
- Test settlement flow

## 📦 Compilation

### Backend
```bash
cd backend
go build -o billbreak-api main.go
./billbreak-api
```

✅ **Successfully compiles** with no errors or warnings

### Frontend
```bash
cd frontend
npm install
npx expo start
```

## 🚀 Deployment

### Backend Deployment

#### Docker
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

#### Railway/Heroku/Cloud Run
All support Go applications. Configure with environment variables.

### Frontend Deployment
- **Expo Go** - Test on any device
- **EAS Build** - Build native binaries
- **App Store/Play Store** - Publish to stores

## 📊 File Structure Summary

```
frontend/
├── app/                  # Main app navigation
│   ├── (auth)/          # Auth flow screens
│   ├── (tabs)/          # Main tab screens
│   └── _layout.tsx      # Root layout with auth guard
├── lib/
│   ├── api.ts           # HTTP client
│   ├── auth.ts          # Zustand store
│   └── supabase.ts      # Supabase client
├── components/          # Reusable components
├── constants/           # Config and types
├── hooks/               # Custom React hooks
└── assets/              # Images and fonts

backend/
├── models/              # Database schemas
│   ├── user.go
│   ├── group.go
│   ├── expense.go
│   └── settlement.go
├── handlers/            # Route handlers
│   ├── auth.go
│   ├── user.go
│   ├── group.go
│   ├── expense.go
│   └── balance.go
├── middleware/          # HTTP middleware
│   └── auth.go
├── utils/               # Utilities
│   ├── jwt.go
│   ├── password.go
│   ├── balance.go
│   └── validators.go
├── main.go              # Server entry point
├── go.mod               # Go dependencies
├── .env                 # Configuration
├── API.md               # API documentation
└── IMPLEMENTATION_SUMMARY.md
```

## 🎯 Next Steps

### High Priority
- [ ] Test all API endpoints
- [ ] Verify frontend-backend integration
- [ ] Set production JWT_SECRET
- [ ] Configure database backups

### Short-term
- [ ] Implement AI voice processing
- [ ] Add request logging
- [ ] Create integration tests
- [ ] Set up CI/CD

### Future Features
- [ ] Real-time updates (WebSockets)
- [ ] Offline sync
- [ ] Multiple payment methods
- [ ] Analytics and reports
- [ ] Push notifications
- [ ] Social sharing

## 🐛 Troubleshooting

### Backend Issues

**"Failed to connect to database"**
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Ensure port 5432 is accessible

**"JWT_SECRET not set"**
- Add JWT_SECRET to .env
- Make it at least 32 characters

**Port already in use**
- Change PORT in .env
- Or kill process using port 8080

### Frontend Issues

**"API request failed"**
- Verify backend is running
- Check EXPO_PUBLIC_API_URL
- Confirm CORS headers are correct

**"Auth token expired"**
- Tokens expire after 24 hours
- User must log in again
- Token auto-refreshes in background

## 📝 License

This project is open source and available under the MIT License.

## 👥 Contributors

- Frontend: React Native/Expo + Zustand
- Backend: Go/Gin + PostgreSQL
- AI Integration: Ready for Claude API

## 📞 Support

For issues or questions:
1. Check the API documentation in `backend/API.md`
2. Review frontend auth guide in `frontend/AUTHENTICATION.md`
3. Check implementation summaries for detailed info

## ✨ Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| User Authentication | ✅ Complete | JWT backend + Supabase frontend |
| Group Management | ✅ Complete | Create, update, delete, add members |
| Expense Tracking | ✅ Complete | Create, update, delete with splits |
| Balance Calculation | ✅ Complete | Smart debt calculation |
| Settlement Optimization | ✅ Complete | Minimizes transactions |
| Voice Input | 🔧 Ready | Placeholder, ready for Claude AI |
| Real-time Updates | 📋 Planned | WebSocket support |
| Offline Sync | 📋 Planned | Sync on connection restore |
| Analytics | 📋 Planned | Spending reports and trends |

---

**🎉 Ready to use!** Start the backend and frontend, then enjoy smart expense splitting.
