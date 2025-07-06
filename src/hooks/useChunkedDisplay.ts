import { useEffect, useRef, useState, useCallback } from 'react';

export interface ChunkedDisplayOptions {
  chunkDuration?: number; // Duration each chunk is displayed (ms)
  autoAdvance?: boolean;  // Whether to auto-advance chunks
  pauseOnInteraction?: boolean; // Pause when user interacts
}

export interface ChunkedDisplayResult {
  currentChunk: string;
  currentIndex: number;
  totalChunks: number;
  isDisplaying: boolean;
  isComplete: boolean;
  isPaused: boolean;
  nextChunk: () => void;
  prevChunk: () => void;
  pauseChunks: () => void;
  resumeChunks: () => void;
  resetChunks: () => void;
  jumpToChunk: (index: number) => void;
}

export function useChunkedDisplay(
  chunks: string[],
  options: ChunkedDisplayOptions = {}
): ChunkedDisplayResult {
  const {
    chunkDuration = 8000, // 8 seconds default
    autoAdvance = true,
    pauseOnInteraction = false,
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<string[]>([]);

  // Update chunks reference when chunks change - always reset for new chunks
  useEffect(() => {
    // Check if chunks actually changed (not just reference)
    const chunksChanged = JSON.stringify(chunksRef.current) !== JSON.stringify(chunks);
    
    chunksRef.current = chunks;
    
    if (chunks.length > 0 && chunksChanged) {
      // Reset display state for new chunks
      setCurrentIndex(0);
      setIsDisplaying(true);
      setIsPaused(false);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else if (chunks.length === 0) {
      // No chunks, stop displaying
      setIsDisplaying(false);
      setCurrentIndex(0);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  }, [chunks]);

  // Auto-advance timer
  useEffect(() => {
    if (!autoAdvance || isPaused || !isDisplaying || chunks.length <= 1) {
      return;
    }

    const startTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= chunks.length) {
            setIsDisplaying(false);
            return prevIndex;
          }
          return nextIndex;
        });
      }, chunkDuration);
    };

    startTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, chunks.length, chunkDuration, autoAdvance, isPaused, isDisplaying]);

  const nextChunk = useCallback(() => {
    if (pauseOnInteraction) {
      setIsPaused(true);
    }
    
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= chunks.length) {
        setIsDisplaying(false);
        return prevIndex;
      }
      return nextIndex;
    });
  }, [chunks.length, pauseOnInteraction]);

  const prevChunk = useCallback(() => {
    if (pauseOnInteraction) {
      setIsPaused(true);
    }
    
    setCurrentIndex(prevIndex => Math.max(0, prevIndex - 1));
  }, [pauseOnInteraction]);

  const pauseChunks = useCallback(() => {
    setIsPaused(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const resumeChunks = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetChunks = useCallback(() => {
    setCurrentIndex(0);
    setIsDisplaying(chunks.length > 0);
    setIsPaused(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [chunks.length]);

  const jumpToChunk = useCallback((index: number) => {
    if (pauseOnInteraction) {
      setIsPaused(true);
    }
    
    const clampedIndex = Math.max(0, Math.min(index, chunks.length - 1));
    setCurrentIndex(clampedIndex);
    
    if (clampedIndex >= chunks.length - 1) {
      setIsDisplaying(false);
    }
  }, [chunks.length, pauseOnInteraction]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const currentChunk = chunks[currentIndex] || '';
  const isComplete = currentIndex >= chunks.length - 1 && !isDisplaying;

  return {
    currentChunk,
    currentIndex,
    totalChunks: chunks.length,
    isDisplaying,
    isComplete,
    isPaused,
    nextChunk,
    prevChunk,
    pauseChunks,
    resumeChunks,
    resetChunks,
    jumpToChunk,
  };
}

// Helper hook for floating chat specific chunked display
export function useFloatingChunkedDisplay(chunks: string[]) {
  return useChunkedDisplay(chunks, {
    chunkDuration: 10000, // 10 seconds for floating mode
    autoAdvance: true,
    pauseOnInteraction: true, // Pause when user taps/interacts
  });
}