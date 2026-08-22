import { z } from 'zod';

export const Strk20EnvSchema = z.object({
  RPC_URL: z.string().url('RPC_URL must be a valid URL'),
  ACCOUNT_ADDRESS: z.string().regex(/^0x[0-9a-fA-F]+$/, 'ACCOUNT_ADDRESS must be a hex string'),
  ACCOUNT_PRIVATE_KEY: z.string().regex(/^0x[0-9a-fA-F]+$/, 'ACCOUNT_PRIVATE_KEY must be a hex string'),
  VIEWING_KEY: z.string().regex(/^[0-9]+$/, 'VIEWING_KEY must be a numeric string (BigInt)'),
  PROVING_SERVICE_URL: z.string().url('PROVING_SERVICE_URL must be a valid URL'),
  INDEXER_URL: z.string().url('INDEXER_URL must be a valid URL'),
  POOL_ADDRESS: z.string().regex(/^0x[0-9a-fA-F]+$/, 'POOL_ADDRESS must be a hex string'),
  CHAIN_ID: z.string().regex(/^0x[0-9a-fA-F]+$/, 'CHAIN_ID must be a hex string'),
});

export type Strk20Env = z.infer<typeof Strk20EnvSchema>;
