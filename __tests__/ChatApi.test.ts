import { POST } from '../src/app/api/chat/route';
import { NextResponse } from 'next/server';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Mock Next.js Response extensions
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => {
      const res = new Response(JSON.stringify(data), init);
      // Add status property for easier testing
      (res as any).status = init?.status || 200;
      return res;
    })
  }
}));

// Mock Gemini SDK
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContentStream: jest.fn().mockResolvedValue({
          stream: (async function* () {
            yield { text: () => 'Test response' };
          })()
        })
      })
    }))
  };
});

describe.skip('Chat API Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns 401 if API key is missing', async () => {
    process.env.GEMINI_API_KEY = '';
    const req = {
      json: async () => ({ 
        messages: [{ role: 'user', content: 'hello', timestamp: Date.now(), id: '1' }], 
        language: 'en' 
      })
    } as any;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('successfully returns a streaming response', async () => {
    const req = {
      json: async () => ({
        messages: [{ role: 'user', content: 'hello', timestamp: Date.now(), id: '1' }],
        language: 'en'
      })
    } as any;
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 500 on invalid payload', async () => {
    const req = {
      json: async () => ({ invalid: 'data' })
    } as any;
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
