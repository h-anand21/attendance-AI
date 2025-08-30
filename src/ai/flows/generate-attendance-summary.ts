'use server';

/**
 * @fileOverview Generates a summary of attendance trends for a given class and date range.
 *
 * - generateAttendanceSummary - A function that generates the attendance summary.
 * - GenerateAttendanceSummaryInput - The input type for the generateAttendanceSummary function.
 * - GenerateAttendanceSummaryOutput - The return type for the generateAttendanceSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAttendanceSummaryInputSchema = z.object({
  classId: z.string().describe('The ID of the class.'),
  startDate: z.string().describe('The start date for the attendance summary (ISO format).'),
  endDate: z.string().describe('The end date for the attendance summary (ISO format).'),
});
export type GenerateAttendanceSummaryInput = z.infer<typeof GenerateAttendanceSummaryInputSchema>;

const GenerateAttendanceSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the attendance trends for the selected class and date range.'),
});
export type GenerateAttendanceSummaryOutput = z.infer<typeof GenerateAttendanceSummaryOutputSchema>;

export async function generateAttendanceSummary(input: GenerateAttendanceSummaryInput): Promise<GenerateAttendanceSummaryOutput> {
  return generateAttendanceSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAttendanceSummaryPrompt',
  input: {schema: GenerateAttendanceSummaryInputSchema},
  output: {schema: GenerateAttendanceSummaryOutputSchema},
  prompt: `You are a helpful assistant that summarizes attendance trends for teachers.

  Given the class ID, start date, and end date, generate a concise summary of the attendance trends.

  Class ID: {{{classId}}}
  Start Date: {{{startDate}}}
  End Date: {{{endDate}}}

  Summary:`, 
});

const generateAttendanceSummaryFlow = ai.defineFlow(
  {
    name: 'generateAttendanceSummaryFlow',
    inputSchema: GenerateAttendanceSummaryInputSchema,
    outputSchema: GenerateAttendanceSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
