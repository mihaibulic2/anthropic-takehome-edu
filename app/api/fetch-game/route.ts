import fs from 'node:fs';
import path from 'node:path';

export async function POST(request: Request) {
  try {
    const gameProps = await request.json();
    
    console.log('fetchGame called with:', gameProps);
    
    // Route to appropriate game template based on gameId
    const gameId = gameProps.gameId;
    const gameFileName = `${gameId}.html`;
    const templatePath = path.join(process.cwd(), 'lib/games', gameFileName);
    
    let gameCode = '';
    
    // Load the specific game template
    gameCode = fs.readFileSync(templatePath, 'utf8');
    
    // Load shared game utilities
    const sharedUtilsPath = path.join(process.cwd(), 'lib/games/shared/utils.js');
    const sharedUtils = fs.readFileSync(sharedUtilsPath, 'utf8');
    
    // Inject shared utilities into the game
    // Insert after the existing script tags but before the game script
    const scriptInsertPoint = gameCode.lastIndexOf('</head>');
    if (scriptInsertPoint !== -1) {
      const beforeHead = gameCode.substring(0, scriptInsertPoint);
      const afterHead = gameCode.substring(scriptInsertPoint);
      
      gameCode = `${beforeHead}  <script>\n${sharedUtils}\n  </script>\n${afterHead}`;
    }
    
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