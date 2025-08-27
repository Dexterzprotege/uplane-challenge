import { NextResponse, NextRequest } from 'next/server';
import { removeBackgroundFromImageBase64, RemoveBgError } from 'remove.bg';
import { put } from '@vercel/blob';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json({ ok: true }, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured.' },
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image_file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const base64img = Buffer.from(fileBuffer).toString('base64');

    const result = await removeBackgroundFromImageBase64({
      base64img,
      apiKey,
      size: 'auto',
      type: 'auto'
    });

    const imageBuffer = Buffer.from(result.base64img, 'base64');

    const flippedBuffer = await sharp(imageBuffer).flop().toBuffer();

    const filename = `${uuid()}-flipped.png`;
    const { url } = await put(filename, flippedBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return NextResponse.json({ url }, { headers: corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    const errors = error as Array<RemoveBgError>;
    const errorMessage = errors?.[0]?.title || 'An unexpected error occurred.';
    return NextResponse.json(
      { error: errorMessage, details: errors },
      { status: 500, headers: corsHeaders }
    );
  }
}
