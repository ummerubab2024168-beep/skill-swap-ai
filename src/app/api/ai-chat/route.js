import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty.' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is too long. Please keep it under 500 characters.'
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key is not configured.'
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You are a helpful and professional AI Assistant for SkillSwap.

Help users with:
- learning new skills
- choosing skills to learn
- creating learning roadmaps
- improving profiles
- preparing for jobs and interviews
- understanding technology and programming
- finding suitable skill exchange ideas

Answer the user's actual question directly.
Do NOT give the same generic response for every question.
Keep answers clear, useful, friendly, and reasonably concise.
If the question is unrelated to SkillSwap, you can still answer it helpfully.`
              }
            ]
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: message
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);

      return NextResponse.json(
        {
          success: false,
          error: data?.error?.message || 'Gemini API request failed.'
        },
        { status: response.status }
      );
    }

    const aiReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiReply) {
      console.error('No Gemini response:', data);

      return NextResponse.json(
        {
          success: false,
          error: 'Gemini did not return a response.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reply: aiReply
    });

  } catch (error) {
    console.error('AI Chat Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Sorry, I am unable to respond right now. Please try again.'
      },
      { status: 500 }
    );
  }
}