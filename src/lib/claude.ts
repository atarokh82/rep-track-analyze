import { supabase } from '../integrations/supabase/client';

const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'; // Using Claude 3.5 Sonnet model (Oct 22, 2024 version)

interface AnalyzeWorkoutInput {
  exerciseTitle: string;
  description?: string | null;
  weightClass: {
    weight: number;
    maxReps: number;
    avgReps: number;
    minReps: number; 
    count: number;
    totalVolume: number;
  };
  workoutHistory: {
    reps: number;
    created_at: string;
  }[];
}

interface WorkoutAnalysis {
  progressTrends: string;
  strengths: string;
  weaknesses: string;
  recommendations: string;
}

export async function analyzeWorkout(input: AnalyzeWorkoutInput): Promise<WorkoutAnalysis> {
  try {
    const prompt = `You are a professional fitness coach analyzing workout data for the exercise "${input.exerciseTitle}"${
      input.description ? ` (${input.description})` : ''
    } at ${input.weightClass.weight} lbs.

Here are the stats for this weight class:
- Max reps: ${input.weightClass.maxReps}
- Average reps: ${input.weightClass.avgReps}
- Min reps: ${input.weightClass.minReps}
- Number of sets: ${input.weightClass.count}
- Total volume: ${input.weightClass.totalVolume} lbs

Workout history (from newest to oldest):
${input.workoutHistory
  .map((w) => `- ${w.reps} reps on ${new Date(w.created_at).toLocaleDateString()}`)
  .join('\n')}

Please analyze this data and provide:
1. Progress trends: Analyze how the performance has changed over time
2. Strengths: What aspects show good performance
3. Weaknesses: Areas that need improvement
4. Recommendations: Specific, actionable advice for improvement

Format your response as a JSON object with these keys: progressTrends, strengths, weaknesses, recommendations.
Keep each section concise (1-2 sentences).`;

    const { data: fnData, error: fnError } = await supabase.functions.invoke('claude-analyze', {
      body: {
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ]
      }
    });

    if (fnError) {
      throw new Error(`Edge function error: ${fnError.message}`);
    }

    // Log the response to help debug
    console.log('Claude API response:', JSON.stringify(fnData, null, 2));
    
    // Handle the response from our edge function
    let analysisText;
    if (fnData.content) {
      // Content is in the response
      analysisText = fnData.content[0].text;
    } else if (fnData.messages && fnData.messages[0].content) {
      // Messages format response
      analysisText = fnData.messages[0].content;
    } else {
      throw new Error('Unexpected response format from Claude API');
    }

    try {
      // Remove any extra quotes and escape characters that might be causing JSON parsing issues
      const cleanedText = analysisText.replace(/\\"/g, '"').replace(/^"|"$/g, '');
      const analysis = JSON.parse(cleanedText);

      return {
        progressTrends: analysis.progressTrends,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
      };
    } catch (parseError) {
      console.error('Failed to parse Claude response:', analysisText);
      throw new Error('Failed to parse workout analysis from Claude');
    }
  } catch (error) {
    console.error('Error analyzing workout:', error);
    throw error;
  }
}
