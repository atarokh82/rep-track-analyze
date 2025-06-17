const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

if (!import.meta.env.VITE_CLAUDE_API_KEY) {
  throw new Error('Missing VITE_CLAUDE_API_KEY environment variable');
}

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

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.content[0].text;
    const analysis = JSON.parse(analysisText);

    return {
      progressTrends: analysis.progressTrends,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
    };
  } catch (error) {
    console.error('Error analyzing workout:', error);
    throw error;
  }
}
