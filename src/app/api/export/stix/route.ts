import { generateStix21Bundle } from '@/server/services/export.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const content = await generateStix21Bundle();
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="CipherNest_STIX2.1_ThreatIntel.json"',
    },
  });
}
