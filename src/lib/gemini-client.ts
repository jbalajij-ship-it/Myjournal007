import { ReflectionMode, JournalMessage } from '../types';

export interface GenerateReflectionParams {
  prompt: string;
  messages?: JournalMessage[];
  mode?: ReflectionMode;
  title?: string;
}

export interface GenerateReflectionResponse {
  text: string;
  modelUsed: string;
  suggestedTitle?: string;
  timestamp: string;
}

export async function requestGeminiReflection(
  params: GenerateReflectionParams
): Promise<GenerateReflectionResponse> {
  const response = await fetch('/api/gemini/reflect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: params.prompt,
      messages: params.messages?.map((m) => ({
        role: m.role,
        content: m.content,
      })) || [],
      mode: params.mode || 'reflect',
      title: params.title || '',
    }),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to generate reflection';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || errJson.message || errorDetail;
    } catch {
      errorDetail = `Server error HTTP ${response.status}`;
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();
  return data as GenerateReflectionResponse;
}
