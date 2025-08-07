export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Claude Sonnet 4.0',
    description: 'Ideal for general purpose tasks',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Claude Opus 4.1',
    description: 'Ideal for for complex reasoning tasks',
  },
];
