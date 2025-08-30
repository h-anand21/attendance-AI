import { config } from 'dotenv';
config();

import '@/ai/flows/generate-attendance-summary.ts';
import '@/ai/flows/analyze-attendance-anomalies.ts';
import '@/ai/flows/recognize-faces.ts';
