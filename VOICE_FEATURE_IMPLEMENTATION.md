# Voice-to-Text Expense Feature Implementation

## Overview
This document describes the complete implementation of the voice recording and AI-powered expense creation feature in BillBreaker.

## Components Implemented

### 1. Frontend - Voice Recorder Component
**File:** `frontend/components/VoiceRecorder.tsx`

Features:
- Records audio using Expo Audio API
- Shows visual feedback (pulsing animation, waveform)
- Sends recorded audio to backend for processing
- Displays processing status ("Processing..." message)
- Handles errors gracefully with alerts
- Supports `onProcessing` callback to disable UI during processing

Props:
- `groupId` (string): The group to associate the expense with
- `onRecordingComplete` (callback): Called when expense is created
- `onPermissionDenied` (callback): Called if microphone permission denied
- `onProcessing` (callback): Called to indicate processing state

### 2. Frontend - Add Expense Screen
**File:** `frontend/app/(tabs)/add.tsx`

Updates:
- Passes `groupId` to VoiceRecorder component
- Handles `onProcessing` callback to show loading state
- Implemented `handleVoiceComplete` to navigate after voice expense creation
- Voice mode now fully functional

### 3. Backend - Voice Processing Utilities
**File:** `backend/utils/voice.go`

Functions:

**TranscribeAudio(audioPath string) (string, error)**
- Uses OpenAI Whisper API to transcribe audio files
- Requires `OPENAI_API_KEY` environment variable
- Returns transcribed text

**ParseExpenseFromText(text string) (*ExpenseDetails, error)**
- Uses GPT-4 to intelligently parse expense details from transcribed text
- Extracts:
  - Amount
  - Description
  - Category (food, transport, entertainment, utilities, shopping, other)
  - Split with (user mentions)
- Returns structured ExpenseDetails

**SimpleParseExpense(text string) (*ExpenseDetails, error)**
- Fallback parsing without AI
- Uses regex and keyword matching
- Less accurate but works without AI API

### 4. Backend - Expense Handler
**File:** `backend/handlers/expense.go`

Updated `ProcessVoiceExpense` handler:
- Accepts multipart/form-data with audio file and group_id
- Saves audio file temporarily
- Transcribes audio using Whisper
- Parses expense details using GPT-4
- Falls back to simple parsing if AI parsing fails
- Creates equal-split expense for all group members
- Cleans up temporary audio file
- Returns created expense with metadata

### 5. Dependencies
**File:** `backend/go.mod`

Added:
- `github.com/sashabaranov/go-openai v1.17.9` - OpenAI SDK for Whisper & GPT integration

## How It Works

### Voice Recording Flow

1. **User taps microphone button** → Records audio
2. **User stops recording** → Audio sent to backend
3. **Backend receives audio** → Saves temporarily
4. **Whisper API transcribes** → Converts speech to text
5. **GPT-4 parses text** → Extracts expense details
6. **Expense created** → Split equally among group members
7. **Audio file deleted** → Cleanup
8. **Response sent** → Frontend shows success/error
9. **User navigated** → Back to home screen

### Example Voice Commands

- "I paid 500 rupees for lunch" → Creates food expense of ₹500
- "Split 1000 for movie tickets" → Creates entertainment expense of ₹1000
- "Gas for 300 rupees" → Creates transport expense of ₹300

## Configuration Required

### Environment Variables

Add to `.env` file in backend:
```
OPENAI_API_KEY=your_api_key_here
```

Get your API key from: https://platform.openai.com/api-keys

## API Endpoint

**POST** `/api/v1/expenses/voice`

Request:
- `group_id`: String (required)
- `audio`: File (required, multipart/form-data)

Response:
```json
{
  "success": true,
  "message": "Expense created from voice recording",
  "expense": { ... },
  "transcribed": "I paid 500 rupees for lunch",
  "amount": 500,
  "category": "food",
  "description": "lunch"
}
```

## Error Handling

1. Missing group_id → 400 Bad Request
2. Missing audio file → 400 Bad Request
3. Failed transcription → 500 Internal Server Error (with fallback attempt)
4. Failed parsing → 400 Bad Request
5. Failed database save → 500 Internal Server Error

## Future Enhancements

1. **Better category detection** from user mentions (e.g., "with Raj" → split with Raj)
2. **Custom split amounts** from voice ("split as 200, 300")
3. **Multiple language support** for transcription
4. **Audio quality optimization** before sending to API
5. **Caching** of transcriptions to reduce API costs
6. **Batch processing** for multiple recordings
7. **Real-time feedback** on recognized amounts/category

## Cost Considerations

- Whisper API: ~$0.02 per minute of audio
- GPT-4 API: Variable based on tokens used
- Consider rate limiting for production use

## Testing

To test voice feature:
1. Start backend: `go run .`
2. Create a group and add members via frontend
3. Go to "Add Expense" tab
4. Switch to "Voice" mode
5. Record: "I paid 500 for lunch"
6. Wait for processing
7. Check if expense appears in group
