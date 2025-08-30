'use server';

/**
 * @fileOverview Analyzes attendance data to identify unusual patterns.
 *
 * - analyzeAttendanceAnomalies - Analyzes attendance data and flags anomalies.
 * - AnalyzeAttendanceAnomaliesInput - The input type for analyzeAttendanceAnomalies.
 * - AnalyzeAttendanceAnomaliesOutput - The output type for analyzeAttendanceAnomalies.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAttendanceAnomaliesInputSchema = z.object({
  attendanceData: z.string().describe('Attendance data in JSON format.'),
  classSection: z.string().describe('The class section to analyze.'),
});
export type AnalyzeAttendanceAnomaliesInput = z.infer<
  typeof AnalyzeAttendanceAnomaliesInputSchema
>;

const AnalyzeAttendanceAnomaliesOutputSchema = z.object({
  anomalies: z
    .array(
      z.object({
        studentId: z.string().describe('The ID of the student.'),
        anomalyType: z.string().describe('The type of anomaly detected.'),
        description: z.string().describe('A description of the anomaly.'),
        date: z.string().describe('The date of the anomaly.'),
      })
    )
    .describe('A list of attendance anomalies.'),
  summary: z
    .string()
    .describe('A summary of the analysis, including overall trends.'),
});
export type AnalyzeAttendanceAnomaliesOutput = z.infer<
  typeof AnalyzeAttendanceAnomaliesOutputSchema
>;

export async function analyzeAttendanceAnomalies(
  input: AnalyzeAttendanceAnomaliesInput
): Promise<AnalyzeAttendanceAnomaliesOutput> {
  return analyzeAttendanceAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAttendanceAnomaliesPrompt',
  input: {schema: AnalyzeAttendanceAnomaliesInputSchema},
  output: {schema: AnalyzeAttendanceAnomaliesOutputSchema},
  prompt: `You are an AI assistant that analyzes attendance data and identifies unusual patterns.
  You will be given attendance data in JSON format and the class section to analyze.
  Your task is to identify any anomalies in the data, such as sudden increases in absences or specific students frequently absent.
  Return a list of anomalies with the student ID, anomaly type, description, and date.
  Also, provide a summary of the analysis, including overall trends.

  Class Section: {{{classSection}}}
  Attendance Data: {{{attendanceData}}}

  Output the data in JSON format.
  `,
});

const analyzeAttendanceAnomaliesFlow = ai.defineFlow(
  {
    name: 'analyzeAttendanceAnomaliesFlow',
    inputSchema: AnalyzeAttendanceAnomaliesInputSchema,
    outputSchema: AnalyzeAttendanceAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
