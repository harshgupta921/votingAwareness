import { z } from 'zod';

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
  timestamp: z.number(),
});

export const conversationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  lastMessage: z.string(),
  updatedAt: z.number(),
  messages: z.array(chatMessageSchema),
});

export const userProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().nullable(),
  createdAt: z.number(),
  lastLogin: z.number(),
  age: z.string().optional(),
  state: z.string().optional(),
});

export const savedLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  label: z.string(),
  notes: z.string().optional(),
  isDefault: z.boolean(),
  type: z.enum(['booth', 'home', 'other']),
  timestamp: z.number(),
});
