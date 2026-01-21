package utils

import (
	"billbreak-backend/models"

	"gorm.io/gorm"
)

type Balance struct {
	UserID string  `json:"user_id"`
	Name   string  `json:"name"`
	Amount float64 `json:"amount"` // Positive = owed money, Negative = owes money
}

// CalculateBalances calculates who owes whom in a group
func CalculateBalances(db *gorm.DB, groupID string) ([]Balance, error) {
	var expenses []models.Expense
	if err := db.Where("group_id = ?", groupID).Preload("PaidByUser").Find(&expenses).Error; err != nil {
		return nil, err
	}

	// Map to track balances: key = userID
	balances := make(map[string]*Balance)

	// Get all group members to initialize balances
	var group models.Group
	if err := db.Preload("Members").First(&group, "id = ?", groupID).Error; err != nil {
		return nil, err
	}

	for _, member := range group.Members {
		balances[member.ID] = &Balance{
			UserID: member.ID,
			Name:   member.Name,
			Amount: 0,
		}
	}

	// Process each expense
	for _, expense := range expenses {
		splits, err := expense.GetSplits()
		if err != nil {
			continue
		}

		// Payer gets credit
		if bal, exists := balances[expense.PaidBy]; exists {
			bal.Amount += expense.Amount
		}

		// Each split person owes money
		for _, split := range splits {
			if bal, exists := balances[split.UserID]; exists {
				bal.Amount -= split.Amount
			}
		}
	}

	// Convert map to slice
	var result []Balance
	for _, bal := range balances {
		result = append(result, *bal)
	}

	return result, nil
}

// SettlementTransaction represents a single payment needed
type SettlementTransaction struct {
	From     string  `json:"from"`
	FromName string  `json:"from_name"`
	To       string  `json:"to"`
	ToName   string  `json:"to_name"`
	Amount   float64 `json:"amount"`
}

// CalculateSettlements determines minimal transactions to settle all debts
func CalculateSettlements(balances []Balance) []SettlementTransaction {
	var transactions []SettlementTransaction

	for {
		// Find user with max debt (most negative)
		var maxDebtIdx int
		maxDebt := 0.0
		for i, b := range balances {
			if b.Amount < maxDebt {
				maxDebt = b.Amount
				maxDebtIdx = i
			}
		}

		// Find user with max credit (most positive)
		var maxCreditIdx int
		maxCredit := 0.0
		for i, b := range balances {
			if b.Amount > maxCredit {
				maxCredit = b.Amount
				maxCreditIdx = i
			}
		}

		// If no significant amounts left, we're done
		if maxDebt == 0 || maxCredit == 0 {
			break
		}

		// Settle the smaller amount
		amount := maxDebt
		if maxCredit < -maxDebt {
			amount = maxCredit
		}
		amount = -amount // Convert to positive

		transactions = append(transactions, SettlementTransaction{
			From:     balances[maxDebtIdx].UserID,
			FromName: balances[maxDebtIdx].Name,
			To:       balances[maxCreditIdx].UserID,
			ToName:   balances[maxCreditIdx].Name,
			Amount:   amount,
		})

		// Update balances
		balances[maxDebtIdx].Amount += amount
		balances[maxCreditIdx].Amount -= amount
	}

	return transactions
}
