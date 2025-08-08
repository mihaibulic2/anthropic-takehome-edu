'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GamePopup, GameData } from './game-popup';
import { AnimatePresence } from 'framer-motion';

interface ContextType {
  showGamePopup: (gameData: GameData) => void;
  registerSendGameStats: (sendStats: (stats: any) => void) => void;
}

const ClaudetteContext = createContext<ContextType | undefined>(undefined);

export function ClaudetteProvider({ children }: { children: React.ReactNode }) {
  const [gameData, setGameData] = useState<GameData | null>(null);
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
    
    setGameData(null);
    setLatestGameStats(null);
  }, [latestGameStats]);

  // Handle LLM requests and game completion from games
  const handleGameMessage = useCallback(async (event: MessageEvent) => {
    if (event.data.type === 'REQUEST_LLM') {
      try {
        const response = await fetch('/api/game-llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: event.data.prompt,
            gameContext: event.data.gameContext
          })
        });

        const result = await response.json();

        // Send response back to game
        if (event.source) {
          (event.source as Window).postMessage({
            type: 'LLM_RESPONSE',
            requestId: event.data.requestId,
            response: result.response,
            error: result.error
          }, '*');
        }
      } catch (error) {
        console.error('Error handling game LLM request:', error);
        
        if (event.source) {
          (event.source as Window).postMessage({
            type: 'LLM_RESPONSE',
            requestId: event.data.requestId,
            error: 'Failed to process LLM request'
          }, '*');
        }
      }
    } else if (event.data.type === 'GAME_STATUS') {
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
    <ClaudetteContext.Provider value={{ showGamePopup: setGameData, registerSendGameStats }}>
      {children}
      <AnimatePresence>
        {gameData && (
          <GamePopup
            key="claudette-popup"
            gameData={gameData}
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