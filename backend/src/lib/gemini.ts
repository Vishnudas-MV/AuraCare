import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.config';
import { logger } from '../utils/logger.util';

/**
 * Gemini AI Client Initialization
 * Uses the latest @google/genai SDK targeting gemini-3.8-flash for clinical transcription
 * and SOAP note summarization.
 */

export const geminiClient = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export const GEMINI_MODEL_CLINICAL = 'gemini-3.8-flash';

logger.info('Gemini AI client configured with model: ' + GEMINI_MODEL_CLINICAL);
