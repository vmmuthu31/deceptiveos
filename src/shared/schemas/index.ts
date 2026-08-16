import { z } from 'zod';

export const CreateHoneypotSchema = z.object({
  name: z.string().min(2).max(50),
  type: z.enum(['Cowrie', 'Dionaea', 'CustomLLM']),
  port: z.number().int().min(1).max(65535),
  temporalJitterMs: z.number().int().min(0).max(5000).default(350),
  twinSyncEnabled: z.boolean().default(true),
});

export const GenerateLureSchema = z.object({
  title: z.string().min(3).max(100),
  docType: z.enum(['PDF', 'DOCX', 'XLSX', 'JSON', 'ENV']),
  targetCompany: z.string().min(2).max(100),
  industry: z.string().min(2).max(100),
  customContext: z.string().optional(),
});

export const BeaconCallbackSchema = z.object({
  watermarkToken: z.string().min(8),
  sourceIp: z.string().ip().optional(),
  userAgent: z.string().optional(),
});
