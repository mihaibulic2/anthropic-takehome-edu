import { tool } from 'ai';
import { z } from 'zod';

export const queryGames = tool({
  description: 'Search for available educational games based on topic, and other parameters',
  inputSchema: z.object({
    topic: z.string().describe("educational topic being taught (eg 'multiplication')"),
    level: z.string().describe("Grade level of the topic (eg 'K', '1', etc)"),
    state: z.string().optional().describe("State in the USA (for matching standards), (eg 'CA')"),
    style: z.string().describe("Art style for the game (eg 'dinosaurs')"),
    sampleData: z.string().describe("Representative questions/answers for the game (eg Q: 2+3 (A: 5), Q: 4x5 (A: 20))"),
  }),

  execute: async ({ topic, level, state, style, sampleData }) => {
    // TODO M3: Implement actual game search logic
    // This will call Claude with list of all games and requirements
    // and return sorted list of options with match scores
    console.log('queryGames called with:', { topic, level, state, style, sampleData });
    
    // Mock response for now
    return {
      games: [
        {
          id: 'times-tables-dino',
          title: 'Dinosaur Times Tables',
          topic,
          level,
          state,
          style,
          sampleData,
          match: 0.95,
          description: `Educational game for ${topic} at ${level} level`
        }
      ],
      totalFound: 1
    };
  },
});