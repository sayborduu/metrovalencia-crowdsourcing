import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const stopName = formData.get('stopName') as string;
    const attribution = formData.get('attribution') as string;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    if (!category || !stopName) {
      return NextResponse.json({ error: 'Faltan campos requeridos (categoría y parada)' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El tamaño del archivo excede el límite de 5MB' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 });
    }

    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${attribution}_${timestamp}.${extension}`;
    
    const blobPath = `${category}/${stopName}/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
      filename: filename,
      category: category,
      stopName: stopName,
      attribution: attribution || 'ANONYMOUS',
    });
  } catch (error) {
    console.error('Error de subida:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
