
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

export async function recognizeFaces(
  input: RecognizeFacesInput
): Promise<RecognizeFacesOutput> {
  return recognizeFacesFlow(input);
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
