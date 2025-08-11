'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GamePopup } from './game-popup';
import { AnimatePresence } from 'framer-motion';
import type { GameProps } from '@/lib/types';

interface ContextType {
  showGamePopup: (gameData: GameProps) => void;
  registerSendGameStats: (sendStats: (stats: any) => void) => void;
}

const ClaudetteContext = createContext<ContextType | undefined>(undefined);

export function ClaudetteProvider({ children }: { children: React.ReactNode }) {
  const [gameProps, setGameProps] = useState<GameProps | null>(null);
  const [latestGameStats, setLatestGameStats] = useState<any>(null);
  const sendGameStatsRef = useRef<((stats: any) => void) | null>(null);

  const registerSendGameStats = useCallback((sendStats: (stats: any) => void) => {
    sendGameStatsRef.current = sendStats;
  }, []);


  const handleGameClosed = useCallback(async () => {
    // Send game stats back to chat if available
    if (latestGameStats && sendGameStatsRef.current) {
      sendGameStatsRef.current(latestGameStats);
    }
    
    setGameProps(null);
    setLatestGameStats(null);
  }, [latestGameStats]);

  // Handle LLM requests and game completion from games
  const handleGameMessage = useCallback(async (event: MessageEvent) => {
    if (event.data.type === 'GAME_STATUS') {
      // Store latest game stats  
      setLatestGameStats(event.data.stats);
    }
  }, []);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleGameMessage);
    return () => {
      window.removeEventListener('message', handleGameMessage);
    };
  }, [handleGameMessage]);

  return (
    <ClaudetteContext.Provider value={{ showGamePopup: setGameProps, registerSendGameStats }}>
      {children}
      <AnimatePresence>
        {gameProps && (
          <GamePopup
            key="claudette-popup"
            gameProps={gameProps}
            onClose={handleGameClosed}
          />
        )}
      </AnimatePresence>
    </ClaudetteContext.Provider>
  );
}

export function useClaudette() {
  const context = useContext(ClaudetteContext);
  if (context === undefined) {
    throw new Error('useClaudette must be used within a ClaudetteProvider');
  }
  return context;
}