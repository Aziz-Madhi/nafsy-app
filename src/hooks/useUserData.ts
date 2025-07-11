import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthState } from "./useAuthState";

// OPTIMIZATION: Consolidated user data fetching pattern following LEVER framework
// Eliminates duplicate query logic across multiple screens and provides consistent loading states

export function useUserData() {
  const { convexUser: user, isLoadingUser, ...authState } = useAuthState();
  
  // Consolidated queries that are used across multiple screens
  const moodStats = useQuery(api.moods.getMoodStats,
    user?._id ? { userId: user._id, days: 30 } : "skip"
  );
  
  const exerciseStats = useQuery(api.exercises.getExerciseStats,
    user?._id ? { userId: user._id, days: 30 } : "skip"
  );
  
  const latestMood = useQuery(api.moods.getLatestMood,
    user?._id ? { userId: user._id } : "skip"
  );
  
  const moodHistory = useQuery(api.moods.getUserMoods, 
    user?._id ? { userId: user._id, limit: 30, days: 30 } : "skip"
  );
  
  const exerciseHistory = useQuery(api.exercises.getUserExercises,
    user?._id ? { userId: user._id, limit: 50 } : "skip"
  );
  
  // Enhanced loading states
  // undefined = still loading, null = loaded but no data, object = loaded with data
  const isDataLoading = isLoadingUser || 
    moodStats === undefined || 
    exerciseStats === undefined ||
    latestMood === undefined;
  
  // hasMinimalData is true when core data is loaded (even if null/empty)
  const hasMinimalData = !isDataLoading && user && 
    moodStats !== undefined && 
    exerciseStats !== undefined;
  
  return {
    // User data
    user,
    isLoadingUser,
    
    // Query results
    moodStats,
    exerciseStats,
    latestMood,
    moodHistory,
    exerciseHistory,
    
    // Enhanced loading states
    isDataLoading,
    hasMinimalData,
    
    // Auth state passthrough
    ...authState,
  };
}

// Specialized hook for screens that only need basic user stats
export function useUserStats() {
  const { convexUser: user, isLoadingUser } = useAuthState();
  
  const moodStats = useQuery(api.moods.getMoodStats,
    user?._id ? { userId: user._id, days: 30 } : "skip"
  );
  
  const exerciseStats = useQuery(api.exercises.getExerciseStats,
    user?._id ? { userId: user._id, days: 30 } : "skip"
  );
  
  return {
    user,
    isLoadingUser,
    moodStats,
    exerciseStats,
    isLoading: isLoadingUser || moodStats === undefined || exerciseStats === undefined,
  };
}