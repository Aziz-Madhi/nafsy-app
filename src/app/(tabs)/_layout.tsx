import { api } from "@/convex/_generated/api";
import { useTranslation } from "@/hooks/useLocale";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useAppTheme } from "@/theme";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";

// Tab icon components using IconSymbol for SF Symbols on iOS
const ChatIcon = ({ color, size }: { color: string; size: number }) => (
  <IconSymbol name="paperplane.fill" size={size} color={color} />
);

const MoodIcon = ({ color, size }: { color: string; size: number }) => (
  <IconSymbol name="face.smiling" size={size} color={color} />
);

const ExercisesIcon = ({ color, size }: { color: string; size: number }) => (
  <IconSymbol name="heart.fill" size={size} color={color} />
);

const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <IconSymbol name="star.fill" size={size} color={color} />
);

export default function TabsLayout() {
  const { isSignedIn } = useAuth();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const { user } = useUser();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const upsertUser = useMutation(api.users.upsertUser);

  // Ref to ensure we only attempt to create the Convex user once
  const hasAttemptedUserCreation = useRef(false);

  // Get user data from Convex
  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id && isAuthenticated ? { clerkId: user.id } : "skip"
  );

  // Auto-create user in Convex when they first sign up
  useEffect(() => {
    // Guard against multiple invocations which can lead to an update loop.
    if (
      !hasAttemptedUserCreation.current &&
      isSignedIn &&
      isAuthenticated &&
      user &&
      userData === null
    ) {
      hasAttemptedUserCreation.current = true;

      // User exists in Clerk but not in Convex, create them
      upsertUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.firstName || user.fullName || "User",
      }).catch((err) => {
        console.error(err);
        // Allow another attempt if the mutation fails for some reason
        hasAttemptedUserCreation.current = false;
      });
    }
  }, [isSignedIn, isAuthenticated, user, userData, upsertUser]);

  // Wait for Convex auth to finish loading before deciding what to do
  if (isConvexLoading) {
    return null; // or a splash / loading indicator
  }

  // Redirect to auth if user is not fully authenticated
  if (!isSignedIn || !isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // If userData is still loading, don't redirect yet
  if (userData === undefined) {
    return null; // or a loading screen
  }

  // Redirect to onboarding if user doesn't exist or hasn't completed onboarding
  if (!userData || !userData.onboardingCompleted) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  const tabLabels = {
    chat: t("navigation.chat"),
    mood: t("navigation.mood"),
    exercises: t("navigation.exercises"),
    profile: t("navigation.profile"),
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.interactive.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.system.border,
        },
        headerShown: false,
        tabBarShowLabel: Platform.OS === "web",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: tabLabels.chat,
          tabBarIcon: ChatIcon,
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: tabLabels.mood,
          tabBarIcon: MoodIcon,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: tabLabels.exercises,
          tabBarIcon: ExercisesIcon,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: tabLabels.profile,
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tabs>
  );
}