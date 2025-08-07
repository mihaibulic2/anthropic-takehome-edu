'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ClaudettePopup } from './claudette-popup';
import { AnimatePresence } from 'framer-motion';

interface GameData {
  gameId: string;
  selectedStyle: string;
  questionSpec: string;
  requiredQuestions: string;
  matchScore: number;
  name: string;
  message: string;
}

interface ClaudetteContextType {
  showClaudettePopup: (gameData: GameData) => void;
  hideClaudettePopup: () => void;
}

const ClaudetteContext = createContext<ClaudetteContextType | undefined>(undefined);

export function ClaudetteProvider({ children }: { children: React.ReactNode }) {
  const [gameData, setGameData] = useState<GameData | null>(null);

  const showClaudettePopup = useCallback((gameData: GameData) => {
    setGameData(gameData);
  }, []);

  const hideClaudettePopup = useCallback(() => {
    setGameData(null);
  }, []);

  // Handle LLM requests from games
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
    }
  }, []);

  // Set up message listener
  React.useEffect(() => {
    window.addEventListener('message', handleGameMessage);
    return () => {
      window.removeEventListener('message', handleGameMessage);
    };
  }, [handleGameMessage]);

  return (
    <ClaudetteContext.Provider value={{ showClaudettePopup, hideClaudettePopup }}>
      {children}
      <AnimatePresence>
        {gameData && (
          <ClaudettePopup
            key="claudette-popup"
            gameData={gameData}
            onClose={hideClaudettePopup}
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