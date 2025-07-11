import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useLocale';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

// Deep-link scheme **must** match the value in app.json ("scheme")
const APP_SCHEME = "nafsy-app";
// Standard Clerk mobile redirect path
const REDIRECT_URL = Linking.createURL("sso-callback", { scheme: APP_SCHEME });

export type OAuthStrategy = "oauth_google" | "oauth_apple";

/**
 * Shared OAuth authentication hook
 * Consolidates OAuth logic from sign-in and sign-up screens
 * Following LEVER framework - eliminate code duplication
 */
export function useOAuthAuthentication() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });

  const authenticateWithOAuth = async (
    strategy: OAuthStrategy,
    isLoaded: boolean,
    setActive: (session: { session: string }) => Promise<void>
  ) => {
    if (!isLoaded) {
      console.log("Clerk not loaded yet");
      return;
    }

    try {
      console.log("Starting OAuth flow for:", strategy);
      console.log("Redirect URL:", REDIRECT_URL);
      
      const flow = strategy === "oauth_google" ? googleAuth : appleAuth;
      if (!flow) {
        console.error("OAuth flow not available for", strategy);
        return;
      }

      const { createdSessionId, setActive: _oauthSetActive, signIn, signUp } = await flow({ 
        redirectUrl: REDIRECT_URL 
      });
      
      console.log("OAuth flow result:", { 
        createdSessionId, 
        hasSignIn: !!signIn, 
        hasSignUp: !!signUp 
      });
      
      if (createdSessionId) {
        console.log("Setting active session:", createdSessionId);
        await setActive({ session: createdSessionId });
        console.log("Session set, redirecting to tabs");
        router.replace("/(tabs)");
      } else if (signUp || signIn) {
        console.log("External account verification required");
        // OAuth account needs to be verified
      }
    } catch (err: any) {
      console.error("OAuth error details:", {
        message: err.message,
        errors: err.errors,
        code: err.code,
        status: err.status
      });
      
      const errorMessage = err.errors?.[0]?.longMessage || 
        err.errors?.[0]?.message || 
        err.message || 
        t("OAuth error", { 
          en: "Authentication failed. Please try again.", 
          ar: "فشلت المصادقة. يرجى المحاولة مرة أخرى." 
        });
        
      Alert.alert(
        t("error"),
        errorMessage
      );
    }
  };

  return {
    authenticateWithOAuth,
    redirectUrl: REDIRECT_URL,
  };
}