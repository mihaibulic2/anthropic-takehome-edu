import fs from 'node:fs';
import path from 'node:path';

export async function POST(request: Request) {
  try {
    const gameProps = await request.json();
    
    console.log('fetchGame called with:', gameProps);
    
    // For now, always use the red-screen-game template
    const templatePath = path.join(process.cwd(), 'lib/games/templates/red-screen-game.html');
    let gameCode = fs.readFileSync(templatePath, 'utf8');
    
    // Replace template variables with actual game props
    gameCode = gameCode.replace('{{GAME_PROPS}}', JSON.stringify(gameProps));
    
    return Response.json({ 
      gameCode,
      success: true 
    });
  } catch (error) {
    console.error('Error in fetchGame:', error);
    
    return Response.json({ 
      error: 'Failed to fetch game',
      success: false 
    }, { status: 500 });
  }
}