import { expect, test } from '../fixtures';
import { queryAndShowGames } from '@/lib/ai/tools/query-games';

test.describe('queryAndShowGames tool', () => {
  test('returns matching games for multiplication topic', async () => {
    const result = await queryAndShowGames.execute({
      problemSpec: 'multiplication tables, specifically 7 × 8 and 9 × 4',
      userSpec: '3rd grade student in CA who likes dinosaurs'
    });

    expect(result.results).toBeDefined();
    expect(result.results.length).toBeGreaterThan(0);
    
    const topGame = result.results[0];
    expect(topGame.matchScore).toBeGreaterThanOrEqual(0.3);
    expect(topGame.gameId).toBeDefined();
    expect(topGame.name).toBeDefined();
    expect(topGame.selectedStyle).toBeDefined();
  });

  test('returns matching games for vocabulary topic', async () => {
    const result = await queryAndShowGames.execute({
      problemSpec: 'vocabulary definitions - forest, creek, etc',
      userSpec: '4th grade student in TX who likes forest themes'
    });

    expect(result.results).toBeDefined();
    expect(result.results.length).toBeGreaterThan(0);
  });

  test('returns matching games for fractions topic', async () => {
    const result = await queryAndShowGames.execute({
      problemSpec: 'fractions: 1/2 + 1/4 = 3/4, showing 2/3 of a pizza',
      userSpec: '4th grade student who likes colorful games'
    });

    expect(result.results).toBeDefined();
    expect(result.results.length).toBeGreaterThan(0);
  });

  test('handles no matching games gracefully', async () => {
    const result = await queryAndShowGames.execute({
      problemSpec: 'quantum physics and advanced calculus',
      userSpec: '12th grade AP physics student'
    });

    expect(result.results).toBeDefined();
    expect(result.results.length).toBe(0);
  });

  test('basic structure validation', async () => {
    const result = await queryAndShowGames.execute({
      problemSpec: 'basic addition: 2 + 3 = 5',
      userSpec: '2nd grade student who likes space themes'
    });

    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
  });

  test('games have required properties', async () => {
    const result = await queryAndShowGames.execute({
      problemSpec: 'spelling words like cat and dog',
      userSpec: '2nd grade student who likes fantasy themes'
    });

    if (result.results.length > 0) {
      const game = result.results[0];
      expect(game).toHaveProperty('gameId');
      expect(game).toHaveProperty('name');
      expect(game).toHaveProperty('selectedStyle');
      expect(game).toHaveProperty('matchScore');
      expect(game).toHaveProperty('message');
      
      expect(typeof game.matchScore).toBe('number');
      expect(game.matchScore).toBeGreaterThanOrEqual(0);
      expect(game.matchScore).toBeLessThanOrEqual(1);
    }
  });

  test('returns games sorted by match score', async () => {
    const result = await queryAndShowGames.execute({
      problemSpec: 'basic math: 5 + 3 = 8, 10 - 4 = 6',
      userSpec: '3rd grade student who likes cartoon themes'
    });

    if (result.results.length > 1) {
      for (let i = 0; i < result.results.length - 1; i++) {
        expect(result.results[i].matchScore).toBeGreaterThanOrEqual(result.results[i + 1].matchScore);
      }
    }
  });
});