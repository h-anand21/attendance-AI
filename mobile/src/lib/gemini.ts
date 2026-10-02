import type { Student } from '../types';

// Loaded strictly from .env — NEVER hardcode keys in code
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export interface RecognizeFacesResult {
  recognizedStudentIds: string[];
  recognizedStudentNames: string[];
  error?: string;
}

/**
 * Strips data URI prefix if present and returns clean base64 + mimeType
 */
function parseBase64(
  input: string,
  defaultMime = 'image/jpeg'
): { data: string; mimeType: string } {
  if (input.startsWith('data:')) {
    const match = input.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], data: match[2] };
    }
  }
  return { mimeType: defaultMime, data: input };
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_CLOUD_URL = 'https://attendance-ai-1.onrender.com';
const LOCAL_WIFI_URL = 'http://10.63.17.162:8000';

async function tryUniFace(
  sceneBase64: string,
  students: Student[]
): Promise<RecognizeFacesResult | null> {
  try {
    const studentsPayload = students
      .filter((s) => (s.avatar && s.avatar.length > 50) || (s as any).embedding)
      .map((s) => ({
        id: s.id,
        name: s.name,
        avatar: s.avatar,
        embedding: (s as any).embedding,
      }));

    if (studentsPayload.length === 0) return null;

    // Check custom saved URL in AsyncStorage
    let customUrl: string | null = null;
    try {
      customUrl = await AsyncStorage.getItem('CUSTOM_AI_SERVICE_URL');
    } catch {
      // ignore
    }

    const candidateUrls = [
      customUrl,
      process.env.EXPO_PUBLIC_AI_SERVICE_URL,
      DEFAULT_CLOUD_URL,
      LOCAL_WIFI_URL,
    ].filter(Boolean) as string[];

    const uniqueUrls = Array.from(new Set(candidateUrls));

    for (const baseUrl of uniqueUrls) {
      const cleanUrl = baseUrl.replace(/\/+$/, '');
      const isLocal = cleanUrl.includes('10.63.') || cleanUrl.includes('192.168.') || cleanUrl.includes('127.0.0.1');
      const timeoutMs = isLocal ? 2000 : 30000; // 30s for cloud (Render cold start can take ~50s)

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(`${cleanUrl}/api/recognize-faces`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true',
          },
          body: JSON.stringify({
            scenePhoto: sceneBase64,
            students: studentsPayload,
            threshold: 0.52,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          console.log(`✅ Mobile UniFace matched via ${cleanUrl}:`, data.recognizedStudentIds);
          return {
            recognizedStudentIds: data.recognizedStudentIds || [],
            recognizedStudentNames: data.recognizedStudentNames || [],
          };
        }
      } catch {
        // Try next endpoint in list
      }
    }
  } catch {
    // All UniFace endpoints failed; fall back to Gemini
  }
  return null;
}

/**
 * Biometric Face Recognition: UniFace (local ArcFace) with Google Gemini Cloud Fallback
 */
export async function recognizeFacesWithAI(
  sceneBase64: string,
  students: Student[]
): Promise<RecognizeFacesResult> {
  try {
    // Pure UniFace biometric engine (RetinaFace + ArcFace)
    const unifaceResult = await tryUniFace(sceneBase64, students);
    if (unifaceResult) {
      return unifaceResult;
    }

    return {
      recognizedStudentIds: [],
      recognizedStudentNames: [],
      error: 'AI Biometric service is currently unreachable. Please ensure the backend is active.',
    };
  } catch (error: any) {
    console.error('Face recognition error:', error);
    return {
      recognizedStudentIds: [],
      recognizedStudentNames: [],
      error: error.message || 'Face recognition failed. Please try again.',
    };
  }
}
