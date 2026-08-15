import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { BeaconEvent, LureDocument, WatermarkToken } from '@/shared/types';
import { generateWatermarkSignature } from '@/shared/utils/formatters';
import { generateSemanticLureDocument } from './ai.service';

export async function getAllLures(): Promise<LureDocument[]> {
  const db = readDb();
  return db.lures;
}

export async function getLureContentById(id: string): Promise<{ lure: LureDocument; content: string } | null> {
  const db = readDb();
  const lure = db.lures.find((l) => l.id === id);
  if (!lure) return null;
  const content = db.lureContents[id] || `[CONFIDENTIAL - ${lure.targetCompany}]\nDocument Token: ${lure.watermark.token}`;
  return { lure, content };
}

export async function createLureDocument(data: {
  title: string;
  docType: 'PDF' | 'DOCX' | 'XLSX' | 'JSON' | 'ENV';
  targetCompany: string;
  industry: string;
  customContext?: string;
}): Promise<{ lure: LureDocument; documentContent: string }> {
  const db = readDb();

  const tokenStr = `wt_${Math.random().toString(36).substring(2, 14)}`;
  const watermark: WatermarkToken = {
    token: tokenStr,
    embeddedAt: new Date().toISOString(),
    stegoWhitespaceSignature: generateWatermarkSignature(tokenStr),
    metadataTag: `CN-WM-${tokenStr.substring(3, 11).toUpperCase()}`,
  };

  const rawContent = await generateSemanticLureDocument(data.docType, data.targetCompany, data.industry);

  let watermarkedContent = '';

  if (data.docType === 'PDF') {
    // Generate authentic HTML/PDF container format with pixel canary tracking tag
    watermarkedContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title}</title>
  <!-- Steganographic Watermark Tag: ${watermark.metadataTag} ${watermark.stegoWhitespaceSignature} -->
</head>
<body style="font-family: Arial, sans-serif; padding: 40px; color: #1e293b;">
  <h1 style="color: #0f172a; border-bottom: 2px solid #0284c7;">${data.targetCompany.toUpperCase()} — CONFIDENTIAL EXECUTIVE BRIEF</h1>
  <p style="color: #ef4444; font-weight: bold;">STRICTLY RESTRICTED ACCESS — INDUSTRY: ${data.industry}</p>
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e1; font-family: monospace;">
    <pre>${rawContent}</pre>
  </div>
  <!-- Steganographic Pixel Canary Tracker -->
  <img src="http://localhost:3000/api/lures/beacon?watermarkToken=${tokenStr}" width="1" height="1" style="display:none;" alt="pixel-canary" />
</body>
</html>`;
  } else if (data.docType === 'JSON') {
    watermarkedContent = JSON.stringify(
      {
        company: data.targetCompany,
        industry: data.industry,
        stego_signature: watermark.stegoWhitespaceSignature,
        security_token: watermark.metadataTag,
        pixel_canary_beacon: `http://localhost:3000/api/lures/beacon?watermarkToken=${tokenStr}`,
        config: {
          database_url: `postgresql://admin:${tokenStr}@db.${data.targetCompany.toLowerCase().replace(/\s+/g, '')}.local:5432/production`,
          api_key: `sk_live_${tokenStr}_ciphernest`,
        },
      },
      null,
      2
    );
  } else if (data.docType === 'ENV') {
    watermarkedContent = `# Confidential Environment Config - ${data.targetCompany}
DB_HOST=db-primary.${data.targetCompany.toLowerCase().replace(/\s+/g, '')}.internal
DB_USER=vault_admin
DB_PASS=${tokenStr}
API_SECRET=sk_live_${tokenStr}
# STATIVE_TOKEN=${watermark.metadataTag} ${watermark.stegoWhitespaceSignature}`;
  } else {
    watermarkedContent = `${rawContent}\n\n/* STEGO_WATERMARK:${watermark.stegoWhitespaceSignature} METADATA_TAG:${watermark.metadataTag} BEACON:http://localhost:3000/api/lures/beacon?watermarkToken=${tokenStr} */`;
  }

  const newLure: LureDocument = {
    id: `lure-doc-${Date.now().toString(36)}`,
    title: data.title,
    docType: data.docType,
    targetCompany: data.targetCompany,
    industry: data.industry,
    watermark,
    beaconHitsCount: 0,
    createdAt: new Date().toISOString(),
    downloadUrl: `/api/lures/download/lure-doc-${Date.now().toString(36)}`,
  };

  db.lures.unshift(newLure);
  db.lureContents[newLure.id] = watermarkedContent;
  writeDb(db);

  appendAuditBlock('LURE_DOCUMENT_GENERATED', { id: newLure.id, title: newLure.title, token: tokenStr });

  return { lure: newLure, documentContent: watermarkedContent };
}

export async function getAllBeacons(): Promise<BeaconEvent[]> {
  const db = readDb();
  return db.beacons;
}

export async function recordBeaconHit(watermarkToken: string, sourceIp?: string, userAgent?: string): Promise<BeaconEvent | null> {
  const db = readDb();
  const lure = db.lures.find((l) => l.watermark.token === watermarkToken);
  if (!lure) return null;

  lure.beaconHitsCount += 1;

  const beacon: BeaconEvent = {
    id: `beacon-${Date.now().toString(36)}`,
    lureId: lure.id,
    documentTitle: lure.title,
    watermarkToken,
    sourceIp: sourceIp || '198.51.100.42',
    location: 'External Host (Beacon Received)',
    userAgent: userAgent || 'Mozilla/5.0 (Automated Document Parser)',
    timestamp: new Date().toISOString(),
  };

  db.beacons.unshift(beacon);
  writeDb(db);

  appendAuditBlock('STEGANOGRAPHIC_BEACON_HIT', { lureId: lure.id, token: watermarkToken, ip: beacon.sourceIp });

  return beacon;
}
