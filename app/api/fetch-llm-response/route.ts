import { generateObject } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';

// Simple response schema
const responseSchema = z.object({
  response: z.string()
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const result = await generateObject({
      model: myProvider.languageModel('chat-model'),
      schema: responseSchema,
      prompt: prompt,
    });

    return Response.json({ 
      response: result.object.response
    });
  } catch (error) {
    console.error('Error generating response:', error);
    return Response.json({ 
      error: 'Failed to generate response'
    }, { status: 500 });
  }
}