package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/sashabaranov/go-openai"
)

// ExpenseDetails represents parsed expense information
type ExpenseDetails struct {
	Amount      float64  `json:"amount"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	SplitWith   []string `json:"split_with"` // User IDs to split with
}

// TranscribeAudio transcribes audio file using OpenAI Whisper API
func TranscribeAudio(audioPath string) (string, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OPENAI_API_KEY not set")
	}

	client := openai.NewClient(apiKey)
	ctx := context.Background()

	// Open audio file
	audioFile, err := os.Open(audioPath)
	if err != nil {
		return "", fmt.Errorf("failed to open audio file: %w", err)
	}
	defer audioFile.Close()

	// Create transcription request
	req := openai.AudioRequest{
		Model:    openai.Whisper1,
		FilePath: audioPath,
	}

	// Call Whisper API
	resp, err := client.CreateTranscription(ctx, req)
	if err != nil {
		return "", fmt.Errorf("transcription failed: %w", err)
	}

	return resp.Text, nil
}

// ParseExpenseFromText extracts expense details from transcribed text using AI
func ParseExpenseFromText(text string) (*ExpenseDetails, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY not set")
	}

	client := openai.NewClient(apiKey)
	ctx := context.Background()

	// Create prompt for GPT to extract expense details
	prompt := fmt.Sprintf(`
You are an expense tracking assistant. Extract expense details from the following voice transcription.
Return a JSON object with these exact fields:
{
  "amount": <number>,
  "description": <string>,
  "category": <one of: food, transport, entertainment, utilities, shopping, other>,
  "split_with": <array of user IDs or empty array>
}

Example: "I paid 500 rupees for lunch with Raj and Priya" should return:
{
  "amount": 500,
  "description": "lunch",
  "category": "food",
  "split_with": ["raj", "priya"]
}

If split_with is mentioned but no specific names are given, return empty array.
If amount is not mentioned, return 0.

Transcription: "%s"

Return ONLY the JSON object, no other text.
`, text)

	resp, err := client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: openai.GPT4,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt,
			},
		},
		Temperature: 0.3, // Low temperature for consistent parsing
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse expense with AI: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no response from AI")
	}

	// Parse JSON response
	var details ExpenseDetails
	responseText := strings.TrimSpace(resp.Choices[0].Message.Content)
	
	// Try to extract JSON from response
	jsonStr := extractJSON(responseText)
	if err := json.Unmarshal([]byte(jsonStr), &details); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	// Validate required fields
	if details.Amount <= 0 {
		return nil, fmt.Errorf("amount must be greater than 0")
	}
	if details.Description == "" {
		return nil, fmt.Errorf("description is required")
	}

	return &details, nil
}

// extractJSON extracts JSON object from text
func extractJSON(text string) string {
	// Find first { and last }
	startIdx := strings.Index(text, "{")
	endIdx := strings.LastIndex(text, "}")

	if startIdx == -1 || endIdx == -1 || startIdx > endIdx {
		return text
	}

	return text[startIdx : endIdx+1]
}

// SimpleParseExpense provides basic parsing without AI (fallback)
func SimpleParseExpense(text string) (*ExpenseDetails, error) {
	// Convert to lowercase for matching
	lowerText := strings.ToLower(text)

	// Extract amount (look for numbers followed by rupees, rs, etc.)
	amountStr := extractNumber(lowerText)
	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil || amount <= 0 {
		return nil, fmt.Errorf("could not extract valid amount from: %s", text)
	}

	// Determine category
	category := determineCategoryFromText(lowerText)

	// Extract description (use the full text as description)
	description := strings.TrimSpace(text)
	if len(description) > 100 {
		description = description[:100]
	}

	return &ExpenseDetails{
		Amount:      amount,
		Description: description,
		Category:    category,
		SplitWith:   []string{},
	}, nil
}

// extractNumber extracts the first number from text
func extractNumber(text string) string {
	re := regexp.MustCompile(`\d+(?:\.\d+)?`)
	matches := re.FindAllString(text, -1)
	if len(matches) > 0 {
		return matches[0]
	}
	return "0"
}

// determineCategoryFromText guesses category from text content
func determineCategoryFromText(text string) string {
	keywords := map[string][]string{
		"food":          {"food", "lunch", "dinner", "breakfast", "eat", "restaurant", "pizza", "burger", "coffee", "tea"},
		"transport":     {"taxi", "uber", "bus", "train", "cab", "auto", "ride", "fuel", "petrol", "gas"},
		"entertainment": {"movie", "movie", "concert", "ticket", "show", "game", "gaming", "play", "fun"},
		"utilities":     {"bill", "electric", "water", "internet", "phone", "wifi", "rent", "utility"},
		"shopping":      {"shopping", "buy", "clothes", "shirt", "pants", "shoes", "shop", "purchase"},
	}

	for category, words := range keywords {
		for _, word := range words {
			if strings.Contains(text, word) {
				return category
			}
		}
	}

	return "other"
}
