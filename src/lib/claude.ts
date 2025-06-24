const CLAUDE_API_URL = '/api/claude/messages';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20240620'; // Using Claude 3 Sonnet model (Feb 29, 2024 version)

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

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',  // Using stable API version
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,  // Using Claude Sonnet 3 model
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API request failed: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    const data = await response.json();
    
    // Log the response to help debug
    console.log('Claude API response:', JSON.stringify(data, null, 2));
    
    // Handle the response based on the API version
    let analysisText;
    if (data.content) {
      // Direct API response
      analysisText = data.content[0].text;
    } else if (data.messages) {
      // Messages API response
      analysisText = data.messages[0].content[0].text;
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
