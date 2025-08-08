import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';

export async function POST(request: Request) {
  try {
    const { prompt, gameContext } = await request.json();
    
    console.log('game-llm called with:', { prompt, gameContext });
    
    const { text } = await generateText({
      model: myProvider.languageModel('chat-model'),
      prompt: `You are helping generate educational content for a game.

Game Context:
- Game ID: ${gameContext.gameId}
- Topic: ${gameContext.questionSpec}

User Request: ${prompt}

Please provide a helpful response. If asked for JSON, provide valid JSON. If asked for questions, provide clear educational questions appropriate for the topic.`
    });

    return Response.json({ 
      response: text,
      success: true 
    });
  } catch (error) {
    console.error('Error in game-llm:', error);
    
    return Response.json({ 
      error: 'Failed to generate content',
      success: false 
    }, { status: 500 });
  }
}