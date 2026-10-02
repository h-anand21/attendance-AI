
'use server';

/**
 * @fileOverview Recognizes faces in a scene against a list of student photos.
 *
 * - recognizeFaces - A function that handles the face recognition process.
 * - RecognizeFacesInput - The input type for the recognizeFaces function.
 * - RecognizeFacesOutput - The return type for the recognizeFaces function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { isToday, parseISO } from 'date-fns';

const StudentPhotoSchema = z.object({
  studentId: z.string().describe('The unique ID of the student.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the student, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const RecognizeFacesInputSchema = z.object({
  scenePhotoDataUri: z
    .string()
    .describe(
      "A photo of the scene (e.g., a classroom), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  studentPhotos: z
    .array(StudentPhotoSchema)
    .describe('An array of student photos to check against the scene.'),
  photoCreationDate: z
    .string()
    .optional()
    .describe(
      'The creation date of the scene photo in ISO format (from EXIF data). If provided, it will be validated.'
    ),
});
export type RecognizeFacesInput = z.infer<typeof RecognizeFacesInputSchema>;

const RecognizeFacesOutputSchema = z.object({
  recognizedStudentIds: z
    .array(z.string())
    .describe(
      'An array of student IDs for the students recognized in the scene.'
    ),
});
export type RecognizeFacesOutput = z.infer<typeof RecognizeFacesOutputSchema>;

async function tryUniFace(
  input: RecognizeFacesInput
): Promise<RecognizeFacesOutput | null> {
  const studentsPayload = input.studentPhotos.map((s) => ({
    id: s.studentId,
    name: s.studentId,
    avatar: s.photoDataUri,
  }));

  // Candidate URLs in priority order:
  // 1. Explicit AI_SERVICE_URL or NEXT_PUBLIC_AI_SERVICE_URL
  // 2. Local loopback (for ultra-fast 0ms local development)
  // 3. Render 24/7 Cloud Service (attendance-ai-1.onrender.com)
  const candidateUrls = [
    process.env.AI_SERVICE_URL,
    process.env.NEXT_PUBLIC_AI_SERVICE_URL,
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://attendance-ai-1.onrender.com',
  ].filter(Boolean) as string[];

  const uniqueUrls = Array.from(new Set(candidateUrls));

  for (const baseUrl of uniqueUrls) {
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const targetUrl = `${cleanUrl}/api/recognize-faces`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
        },
        body: JSON.stringify({
          scenePhoto: input.scenePhotoDataUri,
          students: studentsPayload,
          threshold: 0.52,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        console.log(`✅ UniFace ArcFace matched via ${cleanUrl}:`, data.recognizedStudentIds);
        return {
          recognizedStudentIds: data.recognizedStudentIds || [],
        };
      } else {
        console.warn(`UniFace endpoint ${cleanUrl} responded with HTTP ${res.status}`);
      }
    } catch (err: any) {
      // Endpoint unreachable or timed out; try next candidate
      console.log(`UniFace endpoint ${cleanUrl} not reachable (${err?.name || err?.message}), checking next...`);
    }
  }

  return null;
}

export async function recognizeFaces(
  input: RecognizeFacesInput
): Promise<RecognizeFacesOutput> {
  try {
    const unifaceResult = await tryUniFace(input);
    if (unifaceResult) {
      return unifaceResult;
    }
  } catch (err) {
    console.warn('UniFace recognition error:', err);
  }

  // Fallback to Gemini if UniFace is offline
  try {
    return await recognizeFacesFlow(input);
  } catch (error: any) {
    console.error('Face recognition fallback failed (Gemini quota or error):', error?.message || error);
    // Crucial: return empty list rather than throwing unhandled exception to prevent Next.js 500 error!
    return { recognizedStudentIds: [] };
  }
}

const prompt = ai.definePrompt({
  name: 'recognizeFacesPrompt',
  input: { schema: RecognizeFacesInputSchema },
  output: { schema: RecognizeFacesOutputSchema },
  prompt: `You are a highly accurate face recognition AI. Your task is to identify which students from a provided list are present in a given scene (a classroom photo).

You will be given:
1.  A "scene" photo which is an image of the classroom.
2.  A list of student photos, each with a student ID.

Your goal is to compare the faces in the scene photo with the faces in the student photos.

For each student you can positively identify in the scene, add their student ID to the 'recognizedStudentIds' array.

Do not guess. Only include a student ID if you are confident they are in the scene photo. It is better to miss a student than to incorrectly identify one.

Scene Photo:
{{media url=scenePhotoDataUri}}

Student Photos:
{{#each studentPhotos}}
- Student ID: {{this.studentId}}
  Photo: {{media url=this.photoDataUri}}
{{/each}}
`,
});

const recognizeFacesFlow = ai.defineFlow(
  {
    name: 'recognizeFacesFlow',
    inputSchema: RecognizeFacesInputSchema,
    outputSchema: RecognizeFacesOutputSchema,
  },
  async (input) => {
    // Validate photo creation date if provided
    if (input.photoCreationDate) {
      console.log(`Validating photo creation date: ${input.photoCreationDate}`);
      try {
        const photoDate = parseISO(input.photoCreationDate);
        if (!isToday(photoDate)) {
          console.error(
            'Rejected: Photo was not taken today.',
            `Photo date: ${photoDate.toDateString()}, Server date: ${new Date().toDateString()}`
          );
          throw new Error('Photo was not taken today. Please upload a recent photo.');
        }
        console.log('Accepted: Photo date is valid.');
      } catch (e) {
        console.error('Error parsing photo date. Proceeding without validation.', e);
        // Optional: decide if you want to throw an error here or just proceed
      }
    }

    const { output } = await prompt(input);
    return output!;
  }
);
