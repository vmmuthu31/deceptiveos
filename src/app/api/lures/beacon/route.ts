import { getAllBeacons, recordBeaconHit } from '@/server/services/lure.service';
import { BeaconCallbackSchema } from '@/shared/schemas';
import { NextResponse } from 'next/server';

export async function GET() {
  const beacons = await getAllBeacons();
  return NextResponse.json({ success: true, beacons });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = BeaconCallbackSchema.parse(body);
    const beacon = await recordBeaconHit(validated.watermarkToken, validated.sourceIp, validated.userAgent);
    if (!beacon) {
      return NextResponse.json({ success: false, error: 'Invalid watermark token' }, { status: 404 });
    }
    return NextResponse.json({ success: true, beacon });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid beacon payload' }, { status: 400 });
  }
}
