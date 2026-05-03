import { saveConversation } from '@/lib/db';

// Mock Firebase
jest.mock('@/services/FirestoreService', () => ({
  firestoreService: {
    saveConversation: jest.fn((userId, conversationId, messages) => {
      if (messages?.[0]?.role === 'invalid') {
        return Promise.reject(new Error('Invalid message'));
      }
      return Promise.resolve('new-id');
    }),
    getUserConversations: jest.fn(() => Promise.resolve([])),
    getConversation: jest.fn(() => Promise.resolve(null)),
    updateReadinessScore: jest.fn(() => Promise.resolve()),
  }
}));

describe('db.ts tests', () => {
  const userId = 'user123';
  const messages = [{ id: '1', role: 'user', content: 'hello', timestamp: Date.now() }];
  const title = 'Test Title';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call saveConversation on the service', async () => {
    const conversationId = 'conv123';
    await saveConversation(userId, conversationId, messages as any, title);
    
    const { firestoreService } = require('@/services/FirestoreService');
    expect(firestoreService.saveConversation).toHaveBeenCalled();
  });

  it('should create a new conversation via service', async () => {
    const id = await saveConversation(userId, null, messages as any, title);
    
    const { firestoreService } = require('@/services/FirestoreService');
    expect(firestoreService.saveConversation).toHaveBeenCalled();
    expect(id).toBe('new-id');
  });

  it('should fail if messages are invalid', async () => {
    const invalidMessages = [{ id: '1', role: 'invalid', content: '' }];
    await expect(saveConversation(userId, null, invalidMessages as any, title))
      .rejects.toThrow();
  });
});
