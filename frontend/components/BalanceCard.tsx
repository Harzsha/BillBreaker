import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Balance, User } from '@/constants/types';

interface BalanceCardProps {
  balance: Balance;
  otherUser?: User;
  currentUser?: User;
  onSettleUp?: (balance: Balance) => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  otherUser,
  currentUser,
  onSettleUp,
}) => {
  const isOwe = balance.type === 'owe';
  const color = isOwe ? Colors.light.danger : Colors.light.success;
  const backgroundColor = isOwe ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)';

  const handleSettleUp = () => {
    if (!otherUser?.upiId) {
      Alert.alert('UPI ID Not Found', 'The other user has not set up their UPI ID yet.');
      return;
    }

    const amount = balance.amount;
    const message = isOwe
      ? `Payment for expense split`
      : `Receive payment for expense split`;

    const upiUrl = `upi://pay?pa=${otherUser.upiId}&pn=${otherUser.name}&tr=${message}&am=${amount}`;

    Linking.canOpenURL(upiUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(upiUrl);
        } else {
          Alert.alert('UPI Not Available', 'Please install a UPI app to proceed.');
        }
      })
      .catch((err) => {
        console.error('Error opening UPI:', err);
        Alert.alert('Error', 'Could not open UPI app');
      });

    if (onSettleUp) {
      onSettleUp(balance);
    }
  };

  return (
    <View style={[styles.card, { ...SHADOWS.small }, { backgroundColor }]}>
      <View style={styles.container}>
        <View style={styles.userInfo}>
          {otherUser?.avatar && (
            <Image
              source={{ uri: otherUser.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          )}
          <View style={styles.details}>
            <Text style={styles.userName}>{otherUser?.name || 'Unknown'}</Text>
            <Text style={[styles.type, { color }]}>
              {isOwe ? 'You owe' : 'Owes you'}
            </Text>
          </View>
        </View>

        <View style={styles.amountSection}>
          <Text style={[styles.amount, { color }]}>₹{balance.amount}</Text>
          <TouchableOpacity
            style={[styles.settleButton, { backgroundColor: color }]}
            onPress={handleSettleUp}
          >
            <MaterialCommunityIcons name="send" size={16} color="#FFFFFF" />
            <Text style={styles.settleButtonText}>Settle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.large,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.large,
    marginRight: SPACING.md,
  },
  details: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: SPACING.xs,
  },
  type: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  settleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
    gap: SPACING.xs,
  },
  settleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BalanceCard;
