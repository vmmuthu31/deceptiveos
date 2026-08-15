import { BeaconEvent, LureDocument, WatermarkToken } from '@/shared/types';
import { generateWatermarkSignature } from '@/shared/utils/formatters';
import { generateSemanticLureDocument } from './ai.service';

let luresStore: LureDocument[] = [
  {
    id: 'lure-doc-01',
    title: 'Q3_Executive_Compensation_2026.xlsx',
    docType: 'XLSX',
    targetCompany: 'Acme Cyber Security',
    industry: 'Defense & Financial Services',
    watermark: {
      token: 'wt_89f1a2c4e5b6',
      embeddedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      stegoWhitespaceSignature: '\u200B\u200C\u200B\u200C',
      metadataTag: 'CN-WM-89F1A2C4',
    },
    beaconHitsCount: 4,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'lure-doc-02',
    title: 'aws_production_credentials_vault.json',
    docType: 'JSON',
    targetCompany: 'Acme Cyber Security',
    industry: 'Cloud Infrastructure',
    watermark: {
      token: 'wt_3e4d5c6b7a8f',
      embeddedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      stegoWhitespaceSignature: '\u200C\u200B\u200C\u200B',
      metadataTag: 'CN-WM-3E4D5C6B',
    },
    beaconHitsCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

let beaconsStore: BeaconEvent[] = [
  {
    id: 'beacon-01',
    lureId: 'lure-doc-01',
    documentTitle: 'Q3_Executive_Compensation_2026.xlsx',
    watermarkToken: 'wt_89f1a2c4e5b6',
    sourceIp: '185.220.101.4',
    location: 'Frankfurt, Germany (TOR Exit Node)',
    userAgent: 'LibreOffice/7.6 (Linux x86_64)',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'beacon-02',
    lureId: 'lure-doc-02',
    documentTitle: 'aws_production_credentials_vault.json',
    watermarkToken: 'wt_3e4d5c6b7a8f',
    sourceIp: '194.26.29.112',
    location: 'Bucharest, Romania',
    userAgent: 'python-requests/2.31.0',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
];

export async function getAllLures(): Promise<LureDocument[]> {
  return luresStore;
}

export async function createLureDocument(data: {
  title: string;
  docType: 'PDF' | 'DOCX' | 'XLSX' | 'JSON' | 'ENV';
  targetCompany: string;
  industry: string;
  customContext?: string;
}): Promise<{ lure: LureDocument; documentContent: string }> {
  const tokenStr = `wt_${Math.random().toString(36).substring(2, 14)}`;
  const watermark: WatermarkToken = {
    token: tokenStr,
    embeddedAt: new Date().toISOString(),
    stegoWhitespaceSignature: generateWatermarkSignature(tokenStr),
    metadataTag: `CN-WM-${tokenStr.substring(3, 11).toUpperCase()}`,
  };

  const rawContent = await generateSemanticLureDocument(data.docType, data.targetCompany, data.industry);
  const watermarkedContent = `${rawContent}\n/* ${watermark.stegoWhitespaceSignature} META:${watermark.metadataTag} */`;

  const newLure: LureDocument = {
    id: `lure-doc-${Date.now().toString(36)}`,
    title: data.title,
    docType: data.docType,
    targetCompany: data.targetCompany,
    industry: data.industry,
    watermark,
    beaconHitsCount: 0,
    createdAt: new Date().toISOString(),
  };

  luresStore.unshift(newLure);
  return { lure: newLure, documentContent: watermarkedContent };
}

export async function getAllBeacons(): Promise<BeaconEvent[]> {
  return beaconsStore;
}

export async function recordBeaconHit(watermarkToken: string, sourceIp?: string, userAgent?: string): Promise<BeaconEvent | null> {
  const lure = luresStore.find((l) => l.watermark.token === watermarkToken);
  if (!lure) return null;

  lure.beaconHitsCount += 1;

  const beacon: BeaconEvent = {
    id: `beacon-${Date.now().toString(36)}`,
    lureId: lure.id,
    documentTitle: lure.title,
    watermarkToken,
    sourceIp: sourceIp || '198.51.100.42',
    location: 'External Attacker Host (Beacon Received)',
    userAgent: userAgent || 'Mozilla/5.0 (Automated Document Parser)',
    timestamp: new Date().toISOString(),
  };

  beaconsStore.unshift(beacon);
  return beacon;
}
