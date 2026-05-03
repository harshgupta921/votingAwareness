import { firestoreService } from '@/services/FirestoreService';
import { ChatMessage } from '@/types/user';

export const saveConversation = (userId: string, conversationId: string | null, messages: ChatMessage[], title: string) => {
  return firestoreService.saveConversation(userId, conversationId, messages, title);
};

export const getUserConversations = (userId: string) => {
  return firestoreService.getUserConversations(userId);
};

export const getConversation = (userId: string, conversationId: string) => {
  return firestoreService.getConversation(userId, conversationId);
};

export const updateVoterReadiness = (userId: string, score: number) => {
  return firestoreService.updateReadinessScore(userId, score);
};
