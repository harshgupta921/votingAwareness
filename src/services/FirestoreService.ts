import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Conversation, ChatMessage } from '@/types/user';
import { z } from 'zod';
import { chatMessageSchema, conversationSchema } from '@/lib/validations';

class FirestoreService {
  private static instance: FirestoreService;

  private constructor() {}

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  // Conversation Methods
  async saveConversation(userId: string, conversationId: string | null, messages: ChatMessage[], title: string): Promise<string> {
    try {
      const validatedMessages = z.array(chatMessageSchema).parse(messages);
      const lastMsg = validatedMessages[validatedMessages.length - 1]?.content || '';
      const finalTitle = title || validatedMessages[0]?.content.substring(0, 30) + '...' || 'New Conversation';

      if (conversationId) {
        const convRef = doc(db, `users/${userId}/conversations`, conversationId);
        await updateDoc(convRef, {
          messages: validatedMessages,
          updatedAt: Date.now(),
          lastMessage: lastMsg,
          title: finalTitle
        });
        return conversationId;
      } else {
        const colRef = collection(db, `users/${userId}/conversations`);
        const data = {
          messages: validatedMessages,
          updatedAt: Date.now(),
          lastMessage: lastMsg,
          title: finalTitle,
          createdAt: Date.now(),
          userId
        };
        const newDoc = await addDoc(colRef, data);
        return newDoc.id;
      }
    } catch (error) {
      console.error('FirestoreService.saveConversation error:', error);
      throw error;
    }
  }

  async getUserConversations(userId: string, maxLimit = 50): Promise<Conversation[]> {
    try {
      const colRef = collection(db, `users/${userId}/conversations`);
      const q = query(colRef, orderBy('updatedAt', 'desc'), limit(maxLimit));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
    } catch (error) {
      console.error('FirestoreService.getUserConversations error:', error);
      return [];
    }
  }

  async getConversation(userId: string, conversationId: string): Promise<Conversation | null> {
    try {
      const docRef = doc(db, `users/${userId}/conversations`, conversationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Conversation;
      }
      return null;
    } catch (error) {
      console.error('FirestoreService.getConversation error:', error);
      return null;
    }
  }

  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    try {
      const docRef = doc(db, `users/${userId}/conversations`, conversationId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('FirestoreService.deleteConversation error:', error);
      throw error;
    }
  }

  // Voter Readiness Methods
  async updateReadinessScore(userId: string, score: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const history = data.readinessScore?.history || [];
        
        await updateDoc(userRef, {
          'readinessScore.score': score,
          'readinessScore.lastUpdated': Date.now(),
          'readinessScore.history': [...history, { score, timestamp: Date.now() }]
        });
      }
    } catch (error) {
      console.error('FirestoreService.updateReadinessScore error:', error);
      throw error;
    }
  }
}

export const firestoreService = FirestoreService.getInstance();
