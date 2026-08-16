import { getDeceptionEffectivenessScore } from '@/server/services/effectiveness.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const score = await getDeceptionEffectivenessScore();
  return NextResponse.json({ success: true, score });
}
