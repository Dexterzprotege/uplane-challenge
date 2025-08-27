import { NextResponse, NextRequest } from 'next/server';
import { removeBackgroundFromImageBase64, RemoveBgError } from 'remove.bg';
import { put } from '@vercel/blob';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image_file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided.' },
        { status: 400 }
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

    const flippedBuffer = await sharp(imageBuffer)
      .flop() // horizontal flip
      .toBuffer();

    const filename = `${uuid()}-flipped.png`;
    const { url } = await put(filename, flippedBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return NextResponse.json({ url }); // hosted flipped image
  } catch (error) {
    console.error('API Error:', error);
    const errors = error as Array<RemoveBgError>;
    const errorMessage = errors?.[0]?.title || 'An unexpected error occurred.';
    return NextResponse.json(
      { error: errorMessage, details: errors },
      { status: 500 }
    );
  }
}
