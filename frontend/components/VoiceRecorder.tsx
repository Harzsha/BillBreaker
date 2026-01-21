import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, SPACING } from '@/constants/theme';
import { apiService } from '@/lib/api';

interface VoiceRecorderProps {
  groupId: string;
  onRecordingComplete?: (expenseData: any) => void;
  onPermissionDenied?: () => void;
  onProcessing?: (isProcessing: boolean) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  groupId,
  onRecordingComplete,
  onPermissionDenied,
  onProcessing,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const pulseAnim = new Animated.Value(0);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const requestPermission = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      return permission.granted;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const permission = await requestPermission();
      if (!permission) {
        onPermissionDenied?.();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();

      setRecording(rec);
      setIsRecording(true);
      setDuration(0);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setIsRecording(false);
      setRecording(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (uri) {
        setIsProcessing(true);
        onProcessing?.(true);
        await processVoiceExpense(uri);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const processVoiceExpense = async (audioUri: string) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('group_id', groupId);
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: `expense-${Date.now()}.wav`,
      } as any);

      // Call backend voice processing endpoint
      const response = await apiService.processVoiceExpense(formData);
      
      if (response.data) {
        Alert.alert(
          'Success',
          'Expense created from voice recording!',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsProcessing(false);
                onProcessing?.(false);
                onRecordingComplete?.(response.data);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error processing voice expense:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to process voice expense';
      Alert.alert('Error', errorMessage);
      setIsProcessing(false);
      onProcessing?.(false);
    }
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0.2],
  });

  const getWaveformScale = (index: number) => {
    return pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1 + (index * 0.3)],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.recordingIndicator}>
        {isRecording && (
          <View style={styles.pulseContainer}>
            <Animated.View
              style={[
                styles.pulseDot,
                { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
              ]}
            />
            <View style={styles.recordingDot} />
          </View>
        )}
        {isProcessing && (
          <View style={styles.pulseContainer}>
            <MaterialCommunityIcons name="loading" size={24} color={Colors.light.primary} />
          </View>
        )}

        <Text style={styles.recordingText}>
          {isProcessing ? 'Processing...' : isRecording ? `Recording... ${duration}s` : 'Tap to record'}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.micButton,
          isRecording && styles.micButtonActive,
          isProcessing && styles.micButtonDisabled,
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <MaterialCommunityIcons name="clock-outline" size={40} color="#FFFFFF" />
        ) : isRecording ? (
          <MaterialCommunityIcons name="stop-circle" size={40} color="#FFFFFF" />
        ) : (
          <MaterialCommunityIcons name="microphone" size={40} color={Colors.light.primary} />
        )}
      </TouchableOpacity>

      {isRecording && (
        <View style={styles.waveformContainer}>
          {[...Array(5)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveformBar,
                {
                  transform: [{ scaleY: getWaveformScale(i) }],
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  recordingIndicator: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  pulseContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pulseDot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.danger,
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.danger,
    zIndex: 1,
  },
  recordingText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.background,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: Colors.light.danger,
    borderColor: Colors.light.danger,
  },
  micButtonDisabled: {
    opacity: 0.6,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  waveformBar: {
    width: 4,
    height: 20,
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
});

export default VoiceRecorder;
