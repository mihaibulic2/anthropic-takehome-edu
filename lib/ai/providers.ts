import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { anthropic } from '@ai-sdk/anthropic';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': anthropic('claude-sonnet-4-0'),
        'chat-model-reasoning': anthropic('claude-opus-4-1'),
        'title-model': anthropic('claude-3-5-haiku-latest'),
        'artifact-model': anthropic('claude-sonnet-4-0'),

        // Legacy xAI models (keeping for fallback)
        'xai-chat': xai('grok-2-vision-1212'),
        'xai-reasoning': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
      },
      imageModels: {
        'small-model': xai.imageModel('grok-2-image'),
      },
    });
