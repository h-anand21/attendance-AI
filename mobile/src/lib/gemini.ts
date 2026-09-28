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
      LOCAL_WIFI_URL,
      DEFAULT_CLOUD_URL,
      'https://attendease-uniface-ai.loca.lt',
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
    // 1. Try UniFace biometric engine first (10ms, unlimited, free)
    const unifaceResult = await tryUniFace(sceneBase64, students);
    if (unifaceResult) {
      return unifaceResult;
    }

    // 2. Fall back to Gemini Cloud AI
    if (!GEMINI_API_KEY) {
      return {
        recognizedStudentIds: [],
        recognizedStudentNames: [],
        error:
          'Gemini API key is not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your environment.',
      };
    }

    // Only students who have an avatar photo can be matched
    const studentsWithAvatars = students.filter(
      (s) => s.avatar && s.avatar.length > 50
    );

    if (studentsWithAvatars.length === 0) {
      return {
        recognizedStudentIds: [],
        recognizedStudentNames: [],
        error:
          'No students in this class have profile photos uploaded. Please register students with photos first.',
      };
    }

    const { data: sceneData, mimeType: sceneMime } = parseBase64(
      sceneBase64,
      'image/jpeg'
    );

    const promptText = `You are a highly accurate face recognition AI. Your task is to identify which students from the provided list are present in the given scene photo (a classroom or attendance photo).

Instructions:
1. Carefully analyze the faces present in the scene photo.
2. Compare each detected face against the reference student photos provided below.
3. For every student who is clearly visible and matches their reference photo, add their exact student ID to the 'recognizedStudentIds' array.
4. Do not guess. Only include a student ID if you are confident they are in the scene photo. It is better to miss a student than to incorrectly identify one.

Respond ONLY with a JSON object in this exact format:
{
  "recognizedStudentIds": ["student_id_here"]
}`;

    const parts: any[] = [
      { text: promptText },
      { text: '=== SCENE PHOTO (Classroom / Attendance) ===' },
      {
        inline_data: {
          mime_type: sceneMime,
          data: sceneData,
        },
      },
      { text: '=== REFERENCE STUDENT PHOTOS ===' },
    ];

    for (const student of studentsWithAvatars) {
      const { data: avatarData, mimeType: avatarMime } = parseBase64(
        student.avatar,
        'image/jpeg'
      );
      parts.push({
        text: `Student ID: "${student.id}", Name: "${student.name}"`,
      });
      parts.push({
        inline_data: {
          mime_type: avatarMime,
          data: avatarData,
        },
      });
    }

    // Priority: gemini-flash-latest (fastest & high RPM), gemini-2.5-flash, gemini-3.8-flash
    const candidateModels = [
      'gemini-flash-latest',
      'gemini-2.5-flash',
      'gemini-3.8-flash',
    ];
    let lastErrorMsg = '';
    let data: any = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts,
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          data = await response.json();
          break;
        } else {
          const errorBody = await response.text();
          console.warn(`Gemini API (${model}) status ${response.status}:`, errorBody);
          try {
            const parsedErr = JSON.parse(errorBody);
            const rawMsg = parsedErr?.error?.message || '';
            if (response.status === 429 || rawMsg.toLowerCase().includes('quota')) {
              lastErrorMsg = 'Rate limit reached (Free tier). Please wait 15-20s before scanning again.';
            } else {
              lastErrorMsg = rawMsg || `AI error ${response.status}`;
            }
          } catch {
            lastErrorMsg = `AI error ${response.status}`;
          }
        }
      } catch (err: any) {
        lastErrorMsg = err.message || 'Network request failed';
      }
    }

    if (!data) {
      throw new Error(lastErrorMsg || 'AI Service could not process image.');
    }
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return { recognizedStudentIds: [], recognizedStudentNames: [] };
    }

    const parsed = JSON.parse(candidateText);
    const rawIds: string[] = Array.isArray(parsed.recognizedStudentIds)
      ? parsed.recognizedStudentIds
      : [];

    // Filter to ensure only IDs of students in the current class are included
    const recognizedStudentIds = rawIds.filter((id) =>
      students.some((s) => s.id === id)
    );
    const recognizedStudentNames = recognizedStudentIds.map(
      (id) => students.find((s) => s.id === id)?.name || id
    );

    return {
      recognizedStudentIds,
      recognizedStudentNames,
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
