import { generateUUID } from '@/lib/utils';
import { expect, test } from '../fixtures';

test.describe('Game Discovery Integration', () => {
  test('chat triggers queryGames for multiplication question', async ({ adaContext }) => {
    const chatId = generateUUID();

    const response = await adaContext.request.post('/api/chat', {
      data: {
        id: chatId,
        message: {
          id: generateUUID(),
          role: 'user',
          content: 'What is 7 × 8? I need help with multiplication.',
          parts: [
            {
              type: 'text',
              text: 'What is 7 × 8? I need help with multiplication.',
            },
          ],
          createdAt: new Date().toISOString(),
        },
        selectedChatModel: 'chat-model',
        selectedVisibilityType: 'private',
      },
    });

    expect(response.status()).toBe(200);

    const text = await response.text();
    const lines = text.split('\n');

    // Look for tool calls in the response
    const toolCalls = lines.filter(line => 
      line.includes('queryAndShowGames')
    );

    // Should have at least one tool call
    expect(toolCalls.length).toBeGreaterThan(0);

    // Response should mention games or educational activities
    expect(text.toLowerCase()).toContain('game');
  });

  test('chat triggers queryGames for fraction question', async ({ adaContext }) => {
    const chatId = generateUUID();

    const response = await adaContext.request.post('/api/chat', {
      data: {
        id: chatId,
        message: {
          id: generateUUID(),
          role: 'user',
          content: 'I don\'t understand fractions. What is 1/2 + 1/4?',
          parts: [
            {
              type: 'text',
              text: 'I don\'t understand fractions. What is 1/2 + 1/4?',
            },
          ],
          createdAt: new Date().toISOString(),
        },
        selectedChatModel: 'chat-model',
        selectedVisibilityType: 'private',
      },
    });

    expect(response.status()).toBe(200);

    const text = await response.text();
    
    // Should trigger game suggestions for fractions
    expect(text.toLowerCase()).toContain('game');
    
    // Look for game popup data
    const gamePopupLines = text.split('\n').filter(line => 
      line.includes('data-gamePopup')
    );
    
    if (gamePopupLines.length > 0) {
      const gamePopupData = JSON.parse(gamePopupLines[0].replace('data: ', ''));
      expect(gamePopupData.type).toBe('data-gamePopup');
      expect(gamePopupData.data).toHaveProperty('gameId');
      expect(gamePopupData.data).toHaveProperty('message');
    }
  });

  test('chat does not trigger games for non-educational queries', async ({ adaContext }) => {
    const chatId = generateUUID();

    const response = await adaContext.request.post('/api/chat', {
      data: {
        id: chatId,
        message: {
          id: generateUUID(),
          role: 'user',
          content: 'What is the weather like today?',
          parts: [
            {
              type: 'text', 
              text: 'What is the weather like today?',
            },
          ],
          createdAt: new Date().toISOString(),
        },
        selectedChatModel: 'chat-model',
        selectedVisibilityType: 'private',
      },
    });

    expect(response.status()).toBe(200);

    const text = await response.text();
    
    // Should not trigger game suggestions for weather queries
    const gameToolCalls = text.split('\n').filter(line => 
      line.includes('queryAndShowGames')
    );
    
    expect(gameToolCalls.length).toBe(0);
  });
});