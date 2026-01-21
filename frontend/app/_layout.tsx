import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/lib/auth';
import { ActivityIndicator, View } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Starting auth check...');
        // Check authentication status on app startup
        await checkAuth();
        console.log('Auth check completed');
      } catch (error) {
        console.error('Auth initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Auth error');
      } finally {
        setAuthChecked(true);
        // Hide splash screen after a short delay to ensure state is updated
        setTimeout(() => {
          SplashScreen.hideAsync().catch((err) => {
            console.warn('Error hiding splash screen:', err);
          });
        }, 100);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors.light.background).catch((err) => {
      console.warn('Error setting background color:', err);
    });
  }, []);

  // Show loading screen while checking auth
  if (!authChecked) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }} edges={['top', 'left', 'right']}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }} edges={['top', 'left', 'right']}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors.light.background,
            },
          }}
        >
          {!isAuthenticated ? (
            // Auth screens
            <Stack.Screen 
              name="(auth)" 
              options={{ 
                headerShown: false,
                gestureEnabled: false,
              }} 
            />
          ) : (
            // Protected app screens
            <>
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false,
                }} 
              />
              <Stack.Screen
                name="group/[id]"
                options={{
                  headerShown: false,
                  presentation: 'card',
                }}
              />
            </>
          )}
        </Stack>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
