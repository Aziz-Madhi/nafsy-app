import { LocaleProvider } from "@/hooks/useLocale";
import { ThemeProvider } from "@/theme";
import { ClerkLoaded, ClerkProvider, useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import "react-native-reanimated";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { tokenCache } from "../../utils/cache";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Resolve Convex URL from env or app.json extras
const convexUrl =
  process.env.EXPO_PUBLIC_CONVEX_URL ||
  (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_CONVEX_URL;

// Initialize Convex client
const convex = convexUrl ? new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
}) : null;

export default function RootLayout() {
  const splashHiddenRef = useRef(false);
  
  useEffect(() => {
    // Hide splash screen after layout is ready
    if (!splashHiddenRef.current) {
      splashHiddenRef.current = true;
      SplashScreen.hideAsync();
    }
  }, []);

  // Resolve Clerk publishable key from env or app.json extras
  const publishableKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey || !convex) {
    console.error(
      "Missing environment variables:\n" +
        (!publishableKey ? " – EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY\n" : "") +
        (!convex ? " – EXPO_PUBLIC_CONVEX_URL\n" : "")
    );

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 16, textAlign: "center" }}>
          {"Environment variables are missing.\n\nPlease define EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY and EXPO_PUBLIC_CONVEX_URL in your .env or app.json extra config and reload the app."}
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LocaleProvider>
        <ThemeProvider>
          <ClerkProvider 
            tokenCache={tokenCache} 
            publishableKey={publishableKey}
          >
            <ConvexProviderWithClerk client={convex} useAuth={useClerkAuth}>
              <ClerkLoaded>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </ClerkLoaded>
            </ConvexProviderWithClerk>
          </ClerkProvider>
        </ThemeProvider>
      </LocaleProvider>
    </GestureHandlerRootView>
  );
}
