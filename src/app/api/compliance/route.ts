import { generateCompliancePDFContent, getComplianceSummary } from '@/server/services/compliance.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const summary = await getComplianceSummary();
  return NextResponse.json({ success: true, summary });
}

export async function POST() {
  const content = await generateCompliancePDFContent();
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="CipherNest_SOC2_Evidence_Report.txt"',
    },
  });
}
