import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const apkPath = path.join(process.cwd(), 'public', 'AttendEase-Release.apk');

  if (!fs.existsSync(apkPath)) {
    return new NextResponse('APK file not found on server.', { status: 404 });
  }

  const stat = fs.statSync(apkPath);
  const fileStream = fs.createReadStream(apkPath);

  // Convert Node ReadStream to Web ReadableStream for Next.js response
  const webStream = new ReadableStream({
    start(controller) {
      fileStream.on('data', (chunk) => controller.enqueue(chunk));
      fileStream.on('end', () => controller.close());
      fileStream.on('error', (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="AttendEase-v1.0.1.apk"',
      'Content-Length': stat.size.toString(),
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
