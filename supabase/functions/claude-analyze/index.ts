// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// @ts-ignore
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ALLOWED_ORIGINS = ['http://localhost:5173', 'https://atarokh82.github.io', 'http://localhost:8080'];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: Message[];
  max_tokens?: number;
}

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, X-Client-Info',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };
}

function validateRequest(body: unknown): body is RequestBody {
  if (!body || typeof body !== 'object') return false;
  
  const requestBody = body as RequestBody;
  if (!Array.isArray(requestBody.messages) || requestBody.messages.length === 0) return false;
  
  return requestBody.messages.every(msg => 
    typeof msg === 'object' &&
    (msg.role === 'user' || msg.role === 'assistant') &&
    typeof msg.content === 'string'
  );
}

serve(async (req) => {
  const origin = req.headers.get('origin') || '';

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders(origin)
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: {
        ...corsHeaders(origin),
        'Allow': 'POST'
      }
    });
  }

  // Validate API key
  if (!ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const body = await req.json();
    
    // Validate request body
    if (!validateRequest(body)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request body. Expected { messages: Array<{ role: "user" | "assistant", content: string }>, max_tokens?: number }'
      }), {
        status: 400,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'messages-2023-12-15'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: body.max_tokens || 1024,
        messages: body.messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Anthropic API error:', error);
      
      return new Response(JSON.stringify({ 
        error: 'Error calling Anthropic API',
        details: error
      }), {
        status: response.status,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'application/json'
      }
    });
  }
});
