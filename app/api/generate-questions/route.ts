import { generateObject } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';
import { GameProps } from '@/lib/types';

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
    const { 
      gameProps,
      count,
      formatSpec,
      questionHistory,
    } = await request.json();

    // Extract relevant properties from gameProps
    const {
      questionSpec,
      requiredQuestions,
    } = gameProps as GameProps;

    // Format question history for the prompt
    const formattedHistory = questionHistory && questionHistory.length > 0
      ? questionHistory.map((item: any, index: number) => {
          return `${index + 1}. "${item.question}"
   Correct Answer: "${item.correctAnswer}"
   Student's Answer: ${item.wasCorrect ? 'Correct' : `Wrong (answered: "${item.userAnswer}")`}`;
        }).join('\n\n')
      : null;

    const result = await generateObject({
      model: myProvider.languageModel('chat-model'),
      schema: questionSchema,
      prompt: `You are an educational question generator for interactive games! Your job is to create engaging, age-appropriate questions that help students learn through play.

## STUDENT/QUESTION CONTEXT
The student is working on: ${questionSpec || 'multiplication tables'}

## STUDENT PERFORMANCE HISTORY
Here are the questions the student has already answered in the past:
${formattedHistory || '(no questions answered yet)'}

${formattedHistory && `
## ADAPTIVE LEARNING GUIDELINES
Based on the student's history:
1. **Avoid Repetition**: Do NOT repeat questions the student got correct (if they got it wrong, after some time, you can reask the question with different wrong answers / order)
2. **Difficulty Adjustment**:
   - If the student is getting most correct, increase difficulty
   - If the student is getting most wrong, decrease difficulty or go to easier concepts
   - Mix in some review questions for concepts they got wrong
3. **Learning Patterns**: Focus more on the types of problems the student struggled with
4. **Variety**: Even when revisiting concepts, present them in new ways to maintain engagement
`}

${requiredQuestions ? `
## REQUIRED QUESTIONS
These questions MUST be present either in your response or in the past questions:
${requiredQuestions}
` : ''}

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

## OUTPUT FORMAT
- Respond only with valid JSON, nothing else
- Your questions must be in a "questions" array: { "questions": [ ... ] }
- Question format: ${formatSpec}
- Include exactly ${count || 10} questions in your response`,
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