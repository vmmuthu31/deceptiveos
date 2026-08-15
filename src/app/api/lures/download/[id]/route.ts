import { getLureContentById } from '@/server/services/lure.service';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await getLureContentById(id);

  if (!result) {
    return NextResponse.json({ success: false, error: 'Lure document not found' }, { status: 404 });
  }

  const filename = result.lure.title || `lure_${id}.txt`;
  let contentType = 'text/plain; charset=utf-8';
  if (filename.endsWith('.json')) contentType = 'application/json; charset=utf-8';
  if (filename.endsWith('.csv')) contentType = 'text/csv; charset=utf-8';

  return new NextResponse(result.content, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
