import { generateObject } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';

// Multiple choice question schema
const multipleChoiceQuestionSchema = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  correctAnswerIndex: z.number()
});

// Matching game question schema
const matchingQuestionSchema = z.object({
  question: z.string(),
  pairsCount: z.number(),
  left: z.record(z.string()),
  right: z.record(z.string()),
  answer: z.record(z.string()),
  difficulty: z.string()
});

// Union schema that accepts both question types
const questionSchema = z.object({
  questions: z.array(z.union([
    multipleChoiceQuestionSchema,
    matchingQuestionSchema
  ]))
});

export async function POST(request: Request) {
  try {
    const { gameProps, count, formatSpec, isFirstGeneration } = await request.json();

    // Extract relevant properties from gameProps
    const {
      questionSpec,
      requiredQuestions,
      problemSpec,
      userSpec
    } = gameProps;

    const result = await generateObject({
      model: myProvider.languageModel('chat-model'),
      schema: questionSchema,
      prompt: `You are an educational question generator for interactive games! Your job is to create engaging, age-appropriate questions that help students learn through play.

## STUDENT CONTEXT
The student is working on: ${problemSpec || 'general math practice'}
Student details: ${userSpec || 'elementary school student'}
${isFirstGeneration ? 'This is the first time generating questions for this student session.' : 'This is a follow-up question generation based on student performance.'}

## QUESTION REQUIREMENTS
Generate exactly ${count} questions that match this specification:
"${questionSpec || 'Basic arithmetic problems suitable for elementary students'}"

${requiredQuestions && requiredQuestions !== 'None specified' && requiredQuestions !== '' ? `
## REQUIRED QUESTIONS
You MUST include these specific questions in your response:
${requiredQuestions}
` : ''}

## OUTPUT FORMAT
${formatSpec || `Each question should be returned in this exact JSON format:
{
  "question": "What is 5 + 3?",
  "answers": ["6", "7", "8", "9"], 
  "correctAnswerIndex": 2
}
Where correctAnswerIndex is 0-3 indicating which answer in the array is correct.`}

## GENERATION GUIDELINES
1. **Difficulty**: Questions should be appropriately challenging but not frustrating for the target student
2. **Variety**: Mix different problem types within the topic area to keep engagement high
3. **Clarity**: Questions should be clear and unambiguous 
4. **Answer Options**: 
   - Provide exactly 4 multiple choice answers
   - Make distractors plausible but clearly incorrect
   - Keep answer text concise (ideally 1-3 words)
5. **Game Compatibility**: Questions should work well in a fast-paced, visual game environment
6. **Educational Value**: Focus on building fundamental understanding, not just memorization

Return your response as a JSON object with a "questions" array containing exactly ${count} question objects.`,
    });

    return Response.json({ 
      questions: result.object.questions,
      success: true 
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return Response.json({ 
      error: 'Failed to generate questions',
      success: false 
    }, { status: 500 });
  }
}