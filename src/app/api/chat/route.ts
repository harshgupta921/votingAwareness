import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { chatMessageSchema } from '@/lib/validations';

const requestSchema = z.object({
  messages: z.array(chatMessageSchema),
  language: z.string(),
  context: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { messages, language, context } = requestSchema.parse(json);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        text: "Please set your GEMINI_API_KEY in the `.env.local` file to use the AI Assistant." 
      }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const languageMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिंदी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
    };
    const fullLanguage = languageMap[language] || 'English';

    console.log(`Processing chat request in ${fullLanguage}. Context length: ${context?.length || 0}`);

    const systemInstruction = `You are a helpful, expert AI Election Assistant for Indian voters.
Your goal is to provide accurate, unbiased, and accessible information about the election process, voter registration, required documents, and polling information in India.
CRITICAL INSTRUCTION: You MUST ALWAYS respond in the SAME LANGUAGE that the user used in their most recent message. For example, if the user asks in Hindi, you MUST reply in Hindi. If the user asks in Tamil, reply in Tamil. 
If the user's language is ambiguous, default to responding entirely in ${fullLanguage}.
If the user asks about something unrelated to elections, democracy, or voting, politely guide them back to the topic.
Keep your answers clear, concise, and easy to read. Use bullet points where appropriate.`;

    // Format history and user message into a single prompt for generateContent
    const userMessage = messages[messages.length - 1].content;
    const historyText = messages.slice(0, -1).map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    
    const contextPrompt = context ? `User context: ${context}\n\n` : '';
    
    const fullPrompt = `${systemInstruction}\n\n${contextPrompt}Conversation History:\n${historyText}\n\nUser: ${userMessage}\nAssistant:`;

    console.log(`Sending streaming prompt to Gemini (model: gemini-2.5-flash)...`);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContentStream(fullPrompt);

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Gemini API Error details:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate response',
      details: error.stack 
    }, { status: 500 });
  }
}
