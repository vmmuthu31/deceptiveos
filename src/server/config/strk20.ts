import { Strk20EnvSchema } from './env.schema';

export interface Strk20Config {
  rpcUrl: string;
  accountAddress: string;
  accountPrivateKey: string;
  viewingKey: bigint;
  provingServiceUrl: string;
  indexerUrl: string;
  poolAddress: string;
  chainId: string;
  devMode: boolean;
}

let cachedConfig: Strk20Config | null = null;

export function getStrk20Config(): Strk20Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const result = Strk20EnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid STRK20 environment variables:\n${errors}`);
  }

  const env = result.data;

  cachedConfig = {
    rpcUrl: env.RPC_URL,
    accountAddress: env.ACCOUNT_ADDRESS,
    accountPrivateKey: env.ACCOUNT_PRIVATE_KEY,
    viewingKey: BigInt(env.VIEWING_KEY),
    provingServiceUrl: env.PROVING_SERVICE_URL,
    indexerUrl: env.INDEXER_URL,
    poolAddress: env.POOL_ADDRESS,
    chainId: env.CHAIN_ID,
    devMode: env.DEV_MODE,
  };

  return cachedConfig;
}

export function resetStrk20Config(): void {
  cachedConfig = null;
}
