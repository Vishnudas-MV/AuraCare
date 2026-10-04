import { Type } from '@google/genai';
import { geminiClient, GEMINI_MODEL_CLINICAL } from '../lib/gemini';
import { SoapStructuredOutput } from '../features/charts/chart.types';
import { logger } from '../utils/logger.util';
import { env } from '../config/env.config';

export class ClinicalAiService {
  /**
   * Generates a structured SOAP note from an ambient doctor-patient dialogue transcript
   */
  public async generateSoapFromTranscript(
    transcriptText: string
  ): Promise<SoapStructuredOutput> {
    if (
      !env.GEMINI_API_KEY ||
      env.GEMINI_API_KEY === 'your_gemini_key' ||
      env.GEMINI_API_KEY === 'placeholder_gemini_key'
    ) {
      logger.warn('Mock Clinical AI summarization triggered due to placeholder GEMINI_API_KEY');
      return {
        subjective: `Patient states symptoms related to: ${transcriptText.slice(0, 100)}...`,
        objective: 'Vitals stable. Physical exam normal.',
        assessment: 'Clinical evaluation pending labs.',
        plan: 'Follow-up as indicated.',
      };
    }

    const systemPrompt = `You are a certified Clinical EHR Documentation Scribe.
Analyze the following patient encounter transcript and generate a structured SOAP note.`;

    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL_CLINICAL,
      contents: `${systemPrompt}\n\nTranscript:\n${transcriptText}`,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            subjective: { type: Type.STRING },
            objective: { type: Type.STRING },
            assessment: { type: Type.STRING },
            plan: { type: Type.STRING },
          },
          required: ['subjective', 'objective', 'assessment', 'plan'],
        },
      },
    });

    if (!response.text) {
      throw new Error('Gemini API did not return output text');
    }

    return JSON.parse(response.text) as SoapStructuredOutput;
  }
}

export const clinicalAiService = new ClinicalAiService();
