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
    selectedStyle: null
  };

  // Initialize game stats
  function initializeStats(gameId, selectedStyle) {
    gameStats = {
      questionsAttempted: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      startTime: Date.now(),
      endTime: null,
      gameId: gameId,
      selectedStyle: selectedStyle
    };
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

  // Get current stats
  function getCurrentStats() {
    const currentTime = Date.now();
    const timeSpent = Math.round((currentTime - gameStats.startTime) / 1000); // seconds
    const accuracy = gameStats.questionsAttempted > 0 ? 
      Math.round((gameStats.correctAnswers / gameStats.questionsAttempted) * 100) : 0;

    return {
      ...gameStats,
      timeSpent: timeSpent,
      accuracy: accuracy,
      endTime: currentTime
    };
  }

  // Send game completion stats to parent
  function sendGameStats(completed = true) {
    const stats = getCurrentStats();
    stats.endTime = Date.now();
    
    window.parent.postMessage({
      type: 'GAME_COMPLETED',
      completed: completed,
      stats: stats
    }, '*');
  }

  // Hardcoded question service - returns basic math problems
  function getQuestions(count = 10) {
    const questions = [
      {
        question: "What is 5 + 3?",
        answers: ["6", "7", "8", "9"],
        correctAnswerIndex: 2
      },
      {
        question: "What is 12 - 4?",
        answers: ["7", "8", "9", "10"],
        correctAnswerIndex: 1
      },
      {
        question: "What is 6 × 2?",
        answers: ["10", "11", "12", "13"],
        correctAnswerIndex: 2
      },
      {
        question: "What is 15 ÷ 3?",
        answers: ["4", "5", "6", "7"],
        correctAnswerIndex: 1
      },
      {
        question: "What is 9 + 6?",
        answers: ["13", "14", "15", "16"],
        correctAnswerIndex: 2
      },
      {
        question: "What is 20 - 7?",
        answers: ["12", "13", "14", "15"],
        correctAnswerIndex: 1
      },
      {
        question: "What is 4 × 3?",
        answers: ["10", "11", "12", "13"],
        correctAnswerIndex: 2
      },
      {
        question: "What is 18 ÷ 2?",
        answers: ["8", "9", "10", "11"],
        correctAnswerIndex: 1
      },
      {
        question: "What is 7 + 8?",
        answers: ["14", "15", "16", "17"],
        correctAnswerIndex: 1
      },
      {
        question: "What is 16 - 9?",
        answers: ["6", "7", "8", "9"],
        correctAnswerIndex: 1
      },
      {
        question: "What is 5 × 4?",
        answers: ["18", "19", "20", "21"],
        correctAnswerIndex: 2
      },
      {
        question: "What is 24 ÷ 4?",
        answers: ["5", "6", "7", "8"],
        correctAnswerIndex: 1
      }
    ];

    // Shuffle questions and return requested count
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
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
    getCurrentStats: getCurrentStats,
    sendGameStats: sendGameStats,
    
    // Question service
    getQuestions: getQuestions,
    
    // Game lifecycle
    setupCloseDetection: setupCloseDetection,
    
    // Utilities
    shuffleArray: shuffleArray,
    getRandomPosition: getRandomPosition,
    getRandomVelocity: getRandomVelocity
  };
})();