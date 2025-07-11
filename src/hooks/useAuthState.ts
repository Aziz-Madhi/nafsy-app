import { useAuth, useUser } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Consolidated authentication state hook
 * Reduces Clerk import overhead across components
 */
export function useAuthState() {
  const { signOut, isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  
  // Fetch Convex user data when available
  const convexUser = useQuery(
    api.users.getUserByClerkId, 
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  
  return {
    // Clerk state
    signOut,
    isSignedIn,
    isLoaded,
    clerkUser,
    
    // Convex user data
    convexUser,
    
    // Computed states
    isAuthenticated: isSignedIn && isLoaded,
    isLoadingAuth: !isLoaded,
    isLoadingUser: !convexUser && !!clerkUser?.id,
    
    // User info
    userId: convexUser?._id,
    displayName: convexUser?.displayName || convexUser?.name,
    email: clerkUser?.emailAddresses[0]?.emailAddress,
  };
}

/**
 * Simplified auth hook for components that only need basic auth state
 */
export function useSimpleAuth() {
  const { signOut, isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  
  return {
    signOut,
    isSignedIn,
    isLoaded,
    clerkUser,
    isAuthenticated: isSignedIn && isLoaded,
  };
}