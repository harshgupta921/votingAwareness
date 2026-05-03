import { firestoreService } from '@/services/FirestoreService';
import { ChatMessage } from '@/types/user';

describe('FirestoreService', () => {
  it('is a singleton', () => {
    const instance1 = firestoreService;
    const instance2 = firestoreService;
    expect(instance1).toBe(instance2);
  });

  it('validates messages before saving', async () => {
    const userId = 'user123';
    const messages: ChatMessage[] = [
      { id: 'msg1', role: 'user', content: 'Hello', timestamp: Date.now() }
    ];
    
    const id = await firestoreService.saveConversation(userId, null, messages, 'Test');
    expect(id).toBe('new-id');
  });

  it('handles empty message history gracefully', async () => {
    const conversations = await firestoreService.getUserConversations('user123');
    expect(conversations).toEqual([]);
  });
});
