import { NextResponse, NextRequest } from 'next/server';
import { removeBackgroundFromImageBase64, RemoveBgError } from 'remove.bg';

export async function POST(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      error: 'API key not configured.'
    }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image_file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const base64img = Buffer.from(fileBuffer).toString('base64');

    const result = await removeBackgroundFromImageBase64({
      base64img,
      apiKey,
      size: "auto",
      type: "auto",
    });

    const imageBuffer = Buffer.from(result.base64img, 'base64');

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    const errors = error as Array<RemoveBgError>;
    const errorMessage = errors?.[0]?.title || 'An unexpected error occurred.';
    return NextResponse.json({ 
      error: errorMessage,
      details: errors
    }, { status: 500 });
  }
}
