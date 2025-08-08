// Shared Game Utilities
// Common functionality used across all educational games

window.GameUtils = (() => {

  // Game stats tracking
  let gameStats = {
    questionsAttempted: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    startTime: Date.now(),
    endTime: null,
    gameId: null,
  };

  // Question history for LLM context
  let questionHistory = [];

  // Initialize game stats
  function initializeStats(gameId) {
    gameStats = {
      questionsAttempted: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      startTime: Date.now(),
      endTime: null,
      gameId: gameId,
    };
    questionHistory = [];
  }

  // Track answer attempt
  function trackAnswer(isCorrect) {
    gameStats.questionsAttempted++;
    if (isCorrect) {
      gameStats.correctAnswers++;
    } else {
      gameStats.wrongAnswers++;
    }
  }

  // Track detailed question history for LLM context
  function trackQuestionHistory(question, userAnswerIndex, isCorrect) {
    questionHistory.push({
      question: question.question,
      answers: question.answers,
      userAnswerIndex: userAnswerIndex,
      correctAnswerIndex: question.correctAnswerIndex,
      isCorrect: isCorrect,
      difficulty: question.difficulty || 'medium'
    });
  }

  // Get current stats
  function getCurrentStats() {
    const currentTime = Date.now();
    const timeSpent = (currentTime - gameStats.startTime) / 1000 / 60; // minutes
    const questions = gameStats.questionsAttempted;
    const correctAnswers = gameStats.correctAnswers;
    const accuracy = questions > 0 ? (correctAnswers / questions) : 0;

    return {
      playTime: `${Math.round(timeSpent)} min`,
      questions: questions,
      correct: correctAnswers,
      accuracy: `${Math.round(100*accuracy)}%`,
    };
  }

  // Send game stats to parent (status updates, not completion)
  function sendGameStats(completed = false) {
    window.parent.postMessage({
      type: 'GAME_STATUS',
      completed: completed,
      stats: getCurrentStats(),
    }, '*');
  }

  // Generate questions using LLM API via postMessage to parent
  async function generateQuestions(gameProps, count, formatSpec, isFirstGeneration = true) {
    return new Promise((resolve) => {
      try {
        const requestId = Math.random().toString(36).substring(7);
        
        // Listen for response from parent
        const handleMessage = (event) => {
          if (event.data.type === 'QUESTIONS_GENERATED' && event.data.requestId === requestId) {
            window.removeEventListener('message', handleMessage);
            resolve(event.data.questions || []);
          } else if (event.data.type === 'QUESTIONS_ERROR' && event.data.requestId === requestId) {
            window.removeEventListener('message', handleMessage);
            console.error('Error generating questions:', event.data.error);
            resolve([]);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Request parent to generate questions
        window.parent.postMessage({
          type: 'GENERATE_QUESTIONS',
          requestId,
          gameProps,
          count,
          formatSpec,
          isFirstGeneration,
          questionHistory: isFirstGeneration ? [] : questionHistory
        }, '*');
        
        // Timeout after 30 seconds
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          console.error('Question generation timed out');
          resolve([]);
        }, 30000);
        
      } catch (error) {
        console.error('Error generating questions:', error);
        resolve([]);
      }
    });
  }

  // Compatibility function - for backwards compatibility
  function getQuestions(count = 10) {
    return [];
  }

  // Setup close detection listeners
  function setupCloseDetection() {
    // Listen for parent notification that game is closing
    window.addEventListener('message', (event) => {
      if (event.data.type === 'GAME_CLOSING') {
        const stats = getCurrentStats();
        if (stats.questionsAttempted > 0) {
          sendGameStats(false); // Game was interrupted/closed by X button
        }
      }
    });

    // Backup: beforeunload listener for other close scenarios
    window.addEventListener('beforeunload', () => {
      // Send stats when game is about to close/unload
      // This catches scenarios like: refresh, navigation, browser close
      const stats = getCurrentStats();
      if (stats.questionsAttempted > 0) {
        sendGameStats(false); // Game was interrupted/closed
      }
    });
  }

  // Utility function to shuffle array
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Utility function to get random position within bounds
  function getRandomPosition(containerWidth, containerHeight, elementWidth = 60, elementHeight = 60, padding = 20) {
    const maxX = containerWidth - elementWidth - padding;
    const maxY = containerHeight - elementHeight - padding;
    const minX = padding;
    const minY = padding;

    return {
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY
    };
  }

  // Utility function to get random velocity
  function getRandomVelocity(minSpeed = 1, maxSpeed = 3) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
    return {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    };
  }

  // Public API
  return {
    // Stats management
    initializeStats: initializeStats,
    trackAnswer: trackAnswer,
    trackQuestionHistory: trackQuestionHistory,
    getCurrentStats: getCurrentStats,
    sendGameStats: sendGameStats,
    
    // Question service
    getQuestions: getQuestions,
    generateQuestions: generateQuestions,
    
    // Game lifecycle
    setupCloseDetection: setupCloseDetection,
    
    // Utilities
    shuffleArray: shuffleArray,
    getRandomPosition: getRandomPosition,
    getRandomVelocity: getRandomVelocity
  };
})();