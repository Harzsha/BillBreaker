# Supabase Authentication & API Integration Guide

## Overview

This frontend has been integrated with Supabase for authentication and a custom backend API for expense management. The app uses Zustand for state management, AsyncStorage for session persistence, and Axios for API calls with automatic token injection.

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1

# App Configuration
EXPO_PUBLIC_APP_NAME=BillBreak AI
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

Key dependencies added:
- `@supabase/supabase-js` - Supabase client
- `zustand` - State management
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Session persistence

## Architecture

### Authentication Flow

```
┌─────────────────┐
│   App Start     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  checkAuth() in Root    │
│  (checks stored session)│
└────────┬────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
Authenticated? 
    │         │
   YES       NO
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ (tabs) │ │ (auth)   │
└────────┘ └──────────┘
```

### Key Files

- **lib/supabase.ts** - Supabase client setup and session management
- **lib/auth.ts** - Zustand auth store with login/signup/logout
- **lib/api.ts** - Axios instance with auth interceptors and all API endpoints
- **app/_layout.tsx** - Root layout with route protection

## Authentication

### Using the Auth Store

```typescript
import { useAuthStore } from '@/lib/auth';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  return (
    <>
      {isAuthenticated && <Text>Hello {user?.name}</Text>}
    </>
  );
}
```

### Login

```typescript
const { login, error } = useAuthStore();
const success = await login('user@example.com', 'password');

if (success) {
  // Auto-redirects to home
} else {
  // Handle error
  console.log(error);
}
```

### Signup

```typescript
const { signup, error } = useAuthStore();
const success = await signup('John Doe', 'user@example.com', 'password');

if (success) {
  // Account created, user logged in
}
```

### Logout

```typescript
const { logout } = useAuthStore();
await logout();
// User redirected to welcome screen
```

## Session Management

Sessions are automatically managed with:

- **AsyncStorage persistence** - Sessions survive app restart
- **Supabase auto-refresh** - Tokens refresh automatically when needed
- **Token injection** - Authorization header added to all API requests
- **Error handling** - 401 responses trigger re-authentication

## API Integration

### Available Endpoints

All endpoints are in `lib/api.ts` and automatically include the auth token:

#### Auth
```typescript
// These go through Supabase, not the backend API
apiService.login(email, password)
apiService.signup(email, password, name)
```

#### Groups
```typescript
apiService.getGroups()                      // GET /groups
apiService.getGroup(groupId)                // GET /groups/:groupId
apiService.createGroup(data)                // POST /groups
apiService.updateGroup(groupId, data)       // PUT /groups/:groupId
apiService.deleteGroup(groupId)             // DELETE /groups/:groupId
```

#### Expenses
```typescript
apiService.createExpense(data)              // POST /expenses
apiService.getExpenses(groupId)             // GET /expenses/:groupId
apiService.updateExpense(expenseId, data)   // PUT /expenses/:expenseId
apiService.deleteExpense(expenseId)         // DELETE /expenses/:expenseId
```

#### Voice Processing (AI)
```typescript
apiService.processVoiceExpense(formData)    // POST /expenses/voice
// formData should contain the audio file
```

#### Balances & Settlements
```typescript
apiService.getBalances(groupId)             // GET /balances/:groupId
apiService.createSettlement(data)           // POST /settlements
apiService.getSettlements(groupId)          // GET /settlements/:groupId
```

#### Users
```typescript
apiService.getUser(userId)                  // GET /users/:userId
apiService.updateUser(userId, data)         // PUT /users/:userId
apiService.getCurrentUser()                 // GET /users/me
```

### Making API Calls

```typescript
import { apiService } from '@/lib/api';

try {
  // Token is automatically added
  const response = await apiService.getGroups();
  const groups = response.data.data; // Adjust based on your API response format
} catch (error) {
  console.error('API Error:', error);
  // Handle error - 401 will auto-redirect to login
}
```

## Route Protection

The app automatically:

1. **Checks authentication on startup** - Looks for stored session in AsyncStorage
2. **Redirects unauthenticated users** - Shows auth screens (welcome/login/signup)
3. **Protects app screens** - Only shows (tabs) routes if authenticated
4. **Handles logout** - Clears session and returns to welcome screen

To protect a route, it must be in the `(tabs)` directory or inside the conditional rendering in `app/_layout.tsx`.

## Loading & Error States

### Home Screen Example

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetchData().catch(err => {
    setError(err.message);
    setLoading(false);
  });
}, []);

if (loading) {
  return <ActivityIndicator />;
}

if (error) {
  return (
    <View>
      <Text>{error}</Text>
      <Button onPress={onRefresh} title="Retry" />
    </View>
  );
}
```

### Add Expense Example

Error handling and loading states already implemented in `app/(tabs)/add.tsx`:
- Loading state during group fetch
- Error display with retry option
- Disabled form during submission
- Success alert with form reset

## Token Refresh

Tokens are automatically refreshed by Supabase when needed. The axios interceptor handles 401 errors:

```typescript
// In lib/api.ts
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // 401 handling - can implement token refresh
      // Currently just logs the error
    }
    return Promise.reject(error);
  }
);
```

## Voice Processing (Future Implementation)

The voice recording component is set up in `app/(tabs)/add.tsx`. To implement:

1. Record audio and get URI
2. Create FormData with audio file
3. Send to backend:

```typescript
const formData = new FormData();
formData.append('audio', {
  uri: recordingUri,
  type: 'audio/m4a',
  name: 'expense.m4a',
});
formData.append('groupId', selectedGroup);

const response = await apiService.processVoiceExpense(formData);
// Backend returns parsed expense details
```

## Common Issues & Solutions

### 401 Unauthorized Errors

**Problem:** Getting 401 on API calls despite being logged in

**Solutions:**
1. Check if `EXPO_PUBLIC_API_URL` is correct in `.env.local`
2. Verify Supabase token is being stored (check AsyncStorage in debugger)
3. Ensure backend is running at the configured URL
4. Check if token has expired (shouldn't with auto-refresh)

### Session Lost After Restart

**Problem:** User gets logged out after app restart

**Solutions:**
1. Check if AsyncStorage is properly initialized
2. Verify `checkAuth()` is called in root layout
3. Check device storage permissions for AsyncStorage

### CORS Issues

**Problem:** API calls failing with CORS error

**Solutions:**
1. Configure backend CORS to allow the app domain/URL
2. Ensure `Content-Type` headers match what backend expects
3. Check if it's a preflight request issue (OPTIONS method)

### Missing Groups or Users

**Problem:** Groups fetch succeeds but returns empty

**Solutions:**
1. Verify backend endpoint returns data in expected format
2. Check if you're authenticated with correct user
3. Ensure backend has test data or proper seeding
4. Check network tab to see actual API response

## Next Steps

1. **Update balances.tsx** - Add real API calls for balances
2. **Update profile.tsx** - Show user info from API
3. **Implement voice processing** - Hook up audio to backend AI
4. **Add group management** - Create/edit/delete groups
5. **Add settlements flow** - UPI linking and settlement tracking

## Testing

### Manual Testing Checklist

- [ ] Can sign up with new account
- [ ] Can log in with existing account
- [ ] Session persists after app restart
- [ ] Can add expense to group
- [ ] Can view groups and expenses
- [ ] Can log out and see welcome screen
- [ ] Error messages display correctly
- [ ] Loading states show appropriately

### Test Credentials

Use your Supabase auth setup to create test accounts, or set up email/password auth in Supabase.

## Debugging

### View Stored Session

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// In React Native debugger or console
AsyncStorage.getItem('authSession').then(console.log);
AsyncStorage.getItem('authToken').then(console.log);
AsyncStorage.getItem('user').then(console.log);
```

### Network Logging

Enable axios request/response logging:

```typescript
// In lib/api.ts
api.interceptors.request.use(config => {
  console.log('API Request:', config.method, config.url);
  return config;
});
```

## Documentation References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com/)
- [AsyncStorage Docs](https://react-native-async-storage.github.io/)
- [Expo Router](https://docs.expo.dev/routing/introduction/)
