import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { toEmail, subject, message } = await request.json();

    if (!toEmail) {
      return NextResponse.json(
        { success: false, message: 'Recipient email is required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'SkillSwap <onboarding@resend.dev>',
      to: [toEmail],
      subject: subject || 'Skill Swap Notification',
      html: `<p>${message || 'You have a new activity on SkillSwap!'}</p>`,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}