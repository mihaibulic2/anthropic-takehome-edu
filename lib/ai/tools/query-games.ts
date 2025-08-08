import { tool, generateObject } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';
import gamesDatabase from '@/lib/data/games.json';

const gameMatchSchema = z.object({
  results: z.array(z.object({
    gameId: z.string(),
    selectedStyle: z.string(),
    questionSpec: z.string(),
    requiredQuestions: z.string(),
    matchScore: z.number().min(0).max(1),
    name: z.string(),
    message: z.string()
  }))
});

// This tool will wait for game completion before returning
// It returns both the query results (matched games) and game results (stats)
export const queryAndShowGames = tool({
  description: 'Search for available educational games and automatically show game popup to user',
  inputSchema: z.object({
    problemSpec: z.string().describe("Short description of the problem user is trying to solve (include exact question if there is one) (eg 'multiplication tables' or 'wants to simplify: x^2 + 4x + 4 = 6x^2 - 8')"),
    userSpec: z.string().describe("Short description of user (eg age/grade, ability level, gender, game preference, things they like, etc)"),
  }),

  execute: async ({ problemSpec, userSpec }) => {
    console.log('queryAndShowGames called with:', { problemSpec, userSpec });
    
    try {
      // Use Claude to match games based on requirements
      const result = await generateObject({
        model: myProvider.languageModel('chat-model'),
        schema: gameMatchSchema,
        prompt: `You are a game matching expert for educational games for kids! 

# AVAILABLE GAMES:
${JSON.stringify(gamesDatabase.games, null, 2)}

# INFORMATION:
- Things about the problem/topic the user is working on: ${problemSpec || 'not specified'}
- Things about the user: ${userSpec || 'not specified'}

# TASK
Use the INFORMATION above to pick the best suited game from the AVAILABLE GAMES list to help the user develop a deep, fundamental understand of the problem or topic in the INFORMATION section. Details:

- Consider the game's description to ensure it can handle the type of question the user wants to work on:
   - Short questions work well with fast-paced games
   - Long questions/definitions need slower-paced games
   - Number answers vs text answers vs visual answers
   - User input method compatibility

- Consider the underlying topic in the problem to find a game that is well suited to that topic   

- Choose one of the art styles supported by the game to use based on the user's preferences

- Include a question spec that explains exactly the type and difficulty of the questions:
  - Example: "Multiplication tables under 10", "Government related vocab words for advanced 5th grader (word=answer, definition=question)"
  - Take into account the problem/topic the user is working on and details about the user:
    - what age/grade are they in?
    - what's their ability?
    - what's the topic?

- Include any REQUIRED exact questions that must be included (optional)
  - Useful if the user is asking for a specific question or set of questions and we want to include them
  - Useful if goal is to build up some of the challenges from a starting to ending point (include easy and final questions)

- Calculate a match score (0.0 to 1.0) based on:
   - Data format suitability for the sample questions (50% weight)
   - Grade level appropriateness (25% weight) 
   - Art style of the game matches the user's preferences (if any) (25% weight)

- Other details about output:
   - Include a short fun name for the game (ideally a pun or something clever that's kid-friendly and we can show the user) (key: name)
   - Include a VERY SHORT (max 8-10 words) cute message for 'Claudette the curious crab' to the user to introduce, pitch, and call to action for this game. Should be excited, encouraging, and mention it's a game to play, like "Let's practice with space adventures!" (key: message)
   - Only include games with match score >= 0.3
   - Sort by match score (highest first)
   - Limit to top 2 results (or less if there are not enough)

# RESPONSE FORMAT (json!)
Return the results in exactly this JSON format:
{
  "results": [
    {
      "gameId": { <ID of the selected game from the AVAILABLE GAMES list> },
      "questionSpec": "<string explaining type / format of question and answers>",
      "requiredQuestions": "<string with questions / answers the MUST be included>",
      "matchScore": <0.0-1.0>,
      "name": "<short fun name for the game to show the user, kid-friendly>",
      "message": "<very short cute message from 'Claudette the curious crab' to show the user to introduce, pitch, and call to action for this game>",
    }
  ]
}
`,
      });

      return { 
        queryResults: result.object.results,
        gameResults: null // Will be populated when game completes
      };
    } catch (error) {
      return { 
        queryResults: [],
        gameResults: null
      };
    }
  },
});