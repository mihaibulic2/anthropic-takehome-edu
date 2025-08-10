'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { GameProps } from '@/lib/types';

interface Props {
  gameProps: GameProps;
  onClose: () => void;
}

export function GamePopup({ gameProps, onClose }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameCode, setGameCode] = useState<string | null>(null);

  // Handle question generation requests from game iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'GENERATE_QUESTIONS') {
        const { requestId, gameProps, count, formatSpec, questionHistory } = event.data;
        
        try {
          const response = await fetch('/api/generate-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameProps,
              count,
              formatSpec,
              questionHistory,
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          // Send questions back to the iframe
          const iframe = document.querySelector('iframe[title*="Game"]') as HTMLIFrameElement;
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'QUESTIONS_GENERATED',
              requestId,
              questions: data.questions || []
            }, '*');
          }
        } catch (error) {
          console.error('Failed to generate questions:', error);
          
          // Send error back to the iframe
          const iframe = document.querySelector('iframe[title*="Game"]') as HTMLIFrameElement;
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'QUESTIONS_ERROR',
              requestId,
              error: error instanceof Error ? error.message : 'Unknown error'
            }, '*');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handlePlay = async () => {
    if (gameCode) {
      // Game already loaded, just show it
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/fetch-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameProps)
      });

      const result = await response.json();
      setGameCode(result.gameCode);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to fetch game:', error);
      // Show error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseGame = () => {
    // Notify the game it's about to close so it can send stats
    const iframe = document.querySelector('iframe[title*="Game"]') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'GAME_CLOSING'
      }, '*');
      
      // Give the game a moment to send stats before closing
      setTimeout(() => {
        onClose(); // Close the entire popup
      }, 100);
    } else {
      onClose(); // Close the entire popup
    }
  };

  // Game modal (full screen)
  if (isPlaying && gameCode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="relative w-[90vw] h-[90vh] bg-white rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={handleCloseGame}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        <iframe
            srcDoc={gameCode}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-modals"
            title={`${gameProps.name} Game`}
          />
        </div>
      </div>
    );
  }

  // Claudette popup (right-15, vertically centered, with spring animation)
  return (
    <motion.div 
      className="fixed right-10 top-1/3 z-50"
      initial={{ 
        x: 400, // Start from off-screen right
        scale: 0.8,
        opacity: 0
      }}
      animate={{ 
        x: 0,
        scale: 1,
        opacity: 1
      }}
      exit={{
        x: 400,
        scale: 0.8,
        opacity: 0
      }}
      transition={{
        type: "spring",
        stiffness: 360,
        damping: 13,
        duration: 0.8,
      }}
    >
        <div className="rounded-[2rem] shadow-2xl w-80 overflow-hidden rotate-1" style={{ background: 'linear-gradient(to bottom right, #ac54f0, #d97757)' }}>
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-gradient-to-r from-purple-500 to-teal-400 hover:from-purple-600 hover:to-teal-500 rounded-full p-1 shadow-md border-2 border-white"
        >
          <X size={28} />
        </button>

        {/* Claudette image */}
        <div className="p-4 pb-2">
          <div className="size-14 mx-auto bg-background rounded-full flex items-center justify-center shadow-lg border-2 border-pink-400 animate-gentle-bounce">
            <img
              src="/images/claudette.png"
              alt="Claudette the Curious Crab"
              className="size-14 object-contain"
              onError={(e) => {
                // Fallback to emoji if image not found
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = '<span class="text-4xl animate-pulse">🦀</span>';
                }
              }}
            />
          </div>
        </div>

        {/* Message */}
        <div className="px-4 pb-2">
          <div className="bg-white rounded-2xl py-2 px-3 text-gray-800 relative shadow-md border-2 border-pink-400 text-center">
            {/* Speech bubble tail */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 size-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-white" />
            <p className="text-sm font-medium leading-relaxed">{gameProps.message}</p>
          </div>
        </div>

        {/* Game title - big and bright */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-bold text-white text-center drop-shadow-lg">
              {gameProps.name}
            </h3>
          </div>
        </div>

        {/* Play button - fun and colorful */}
        <div className="p-4 pt-0 flex justify-center">
          <Button
            onClick={handlePlay}
            disabled={isLoading}
            className="w-1/2 bg-gradient-to-r from-purple-500 to-teal-400 hover:from-purple-600 hover:to-teal-500 text-white font-bold py-5 px-6 rounded-full shadow-lg hover:scale-105 transition-all duration-200 border-4 border-white text-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full size-5 border-3 border-white border-top-transparent mr-2" />
                LOADING...
              </div>
            ) : (
              'PLAY!'
            )}
          </Button>
        </div>
        </div>
    </motion.div>
  );
}