import { supabaseClient } from '../supabase/client';

export interface AIAnalysisRequest {
  exercise: string;
  weight: number;
  workouts: {
    reps: number;
    date: string;
  }[];
  metrics: {
    totalSets: number;
    repProgress: number;
    daysBetween: number;
    averageReps: number;
    maxReps: number;
    minReps: number;
  };
}

export interface AIAnalysisResponse {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  progressTrend: string;
}

export async function getAIAnalysis(data: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  // Call Edge Function using Supabase client
  const { data: response, error } = await supabaseClient.functions.invoke('analyze-workout', {
    body: data
  });

  if (error) {
    console.error('AI Analysis error:', error);
    throw new Error('Failed to get AI analysis');
  }

  return response;
}
