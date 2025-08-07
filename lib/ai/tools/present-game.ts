import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { ChatMessage } from '@/lib/types';

interface PresentGameProps {
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const presentGame = ({ dataStream }: PresentGameProps) => 
  tool({
    description: 'Present a kid friendly pop-up to offer playing an educational game regarding the topic in this chat',
    inputSchema: z.object({
      gameId: z.string().describe("ID of game"),
      topic: z.string().describe("educational topic being taught (eg 'multiplication')"),
      level: z.string().describe("Grade level of the topic (eg 'K', '1', etc)"),
      state: z.string().optional().describe("State in the USA (for matching standards), (eg 'CA')"),
      style: z.string().describe("Art style for the game (eg 'dinosaurs')"),
      data: z.string().describe("JSON questions/answers for the game (eg [ {\"q\": \"2+3\", \"a\": \"5\"}])"),
      message: z.string().optional().describe("Short fun message from Claudette the curious crab, the mascot of these games (eg 'Practice multiplying with DINOSAURS!')"),
    }),
    execute: async ({ gameId, topic, level, state, style, data, message }) => {
      console.log('presentGame server-side executing:', { gameId, topic, level, state, style, data, message });
      
      const claudetteMessage = message || `Hi! I found a fun game to help you learn about ${topic}! Want to play?`;
      
      // Send game popup data to client via data stream
      dataStream.write({
        type: 'data-gamePopup',
        data: {
          gameId,
          topic,
          level,
          state,
          style,
          data,
          message: claudetteMessage,
        },
        transient: true,
      });
      
      return {
        success: true,
        gameId,
        topic,
        message: claudetteMessage,
        status: 'popup_sent_to_client'
      };
    },
  });