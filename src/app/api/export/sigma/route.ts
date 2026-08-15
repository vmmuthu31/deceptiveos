import { generateSigmaRules } from '@/server/services/export.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const content = await generateSigmaRules();
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/yaml; charset=utf-8',
      'Content-Disposition': 'attachment; filename="CipherNest_Sigma_Detection_Rules.yml"',
    },
  });
}
