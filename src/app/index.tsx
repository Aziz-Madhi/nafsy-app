import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

export default function RootIndex() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current || !isLoaded) return;

    hasRedirected.current = true;

    if (isSignedIn) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/welcome");
    }
  }, [isSignedIn, isLoaded, router]);

  return null;
}