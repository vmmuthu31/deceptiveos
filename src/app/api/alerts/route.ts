import { getAllAttackerProfiles } from '@/server/services/fingerprint.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const profiles = await getAllAttackerProfiles();
  return NextResponse.json({ success: true, profiles });
}
