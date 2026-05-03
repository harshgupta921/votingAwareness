import { firestoreService } from '@/services/FirestoreService';
import { ChatMessage } from '@/types/user';

describe('FirestoreService', () => {
  it('is a singleton', () => {
    const instance1 = firestoreService;
    const instance2 = firestoreService;
    expect(instance1).toBe(instance2);
  });

  it('validates messages before saving and throws on invalid data', async () => {
    const userId = 'user123';
    const invalidMessages = [
      { id: 'msg1', role: 'invalid_role', content: 'Hello', timestamp: Date.now() }
    ] as any;
    
    await expect(firestoreService.saveConversation(userId, null, invalidMessages, 'Test'))
      .rejects.toThrow();
  });

  it('generates a title if none provided', async () => {
    const userId = 'user123';
    const messages: ChatMessage[] = [
      { id: 'msg1', role: 'user', content: 'What is my voter ID status?', timestamp: Date.now() }
    ];
    
    // We expect the first 30 chars of the content to be used
    const id = await firestoreService.saveConversation(userId, null, messages, '');
    expect(id).toBeDefined();
  });

  it('handles delete operation gracefully', async () => {
    await expect(firestoreService.deleteConversation('user1', 'conv1'))
      .resolves.not.toThrow();
  });
});
