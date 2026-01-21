import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { dummyUser } from '@/constants/dummy';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(dummyUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editUPI, setEditUPI] = useState(user.upiId || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveProfile = () => {
    if (!editName.trim() || !editUPI.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setUser({
      ...user,
      name: editName,
      upiId: editUPI,
    });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          router.replace('/(auth)/welcome');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, { ...SHADOWS.medium }]}>
          <View style={styles.avatarContainer}>
            {user.avatar && (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            )}
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your name"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.disabledText}>{user.email}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>UPI ID</Text>
                <TextInput
                  style={styles.input}
                  value={editUPI}
                  onChangeText={setEditUPI}
                  placeholder="yourname@upi"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.upiId && <Text style={styles.userUPI}>UPI: {user.upiId}</Text>}
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          {/* Notifications */}
          <View style={[styles.settingItem, { ...SHADOWS.small }]}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="bell" size={20} color={Colors.light.primary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Get expense alerts</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor={notificationsEnabled ? Colors.light.success : Colors.light.textSecondary}
            />
          </View>

          {/* Currency */}
          <View style={[styles.settingItem, { ...SHADOWS.small }]}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="earth" size={20} color={Colors.light.primary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Currency</Text>
                <Text style={styles.settingDescription}>₹ Indian Rupee</Text>
              </View>
            </View>
            <Text style={styles.settingValue}>₹</Text>
          </View>

          {/* Dark Mode */}
          <View style={[styles.settingItem, { ...SHADOWS.small }]}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="weather-night" size={20} color={Colors.light.primary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Coming soon</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor={darkMode ? Colors.light.success : Colors.light.textSecondary}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={[styles.aboutItem, { ...SHADOWS.small }]}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={[styles.aboutItem, { ...SHADOWS.small }]}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>2026.01</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { ...SHADOWS.medium }]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  editButton: {
    padding: SPACING.md,
  },
  userCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editForm: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  disabledText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.sm,
  },
  userUPI: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: SPACING.md,
  },
  settingItem: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.large,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  aboutItem: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.large,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  aboutValue: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  logoutButton: {
    backgroundColor: Colors.light.danger,
    borderRadius: BORDER_RADIUS.large,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
