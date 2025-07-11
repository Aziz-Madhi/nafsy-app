import { useAuth } from "@clerk/clerk-expo";
import { useConvexAuth } from "convex/react";
import { Redirect, Stack, useSegments } from "expo-router";

export default function AuthLayout() {
  const { isSignedIn } = useAuth();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const segments: string[] = useSegments();

  // Wait for Convex auth loading before redirecting
  if (isSignedIn && isConvexLoading) {
    return null;
  }

  const inOnboardingFlow = segments.includes("onboarding");

  // If the user is fully authenticated, redirect to the main app,
  // unless they are on the onboarding screen.
  if (isSignedIn && isAuthenticated && !inOnboardingFlow) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}