import { Account, RpcProvider } from 'starknet';
import { getStrk20Config } from '@/server/config/strk20';
import { PROVING_BLOCK_OFFSET } from '@/server/config/constants';

export interface TransferCallAndProof {
  call: any;
  proof: {
    proofFacts?: any[];
    data?: any;
  };
}

export interface TransferBuilder {
  with: (token: string, callback: (t: any) => any) => TransferBuilder;
  surplusTo: (account: unknown) => TransferBuilder;
  createProofInvocation: (options?: { provingBlockId?: number }) => Promise<unknown>;
  execute: () => Promise<TransferCallAndProof>;
}

export interface PrivateTransfersInterface {
  build: (options?: Record<string, unknown>) => TransferBuilder;
  executeWithInvocation: (invocation: unknown, provingBlockId: number) => Promise<{ callAndProof: TransferCallAndProof }>;
}

let cachedTransfers: PrivateTransfersInterface | null = null;
let cachedProvider: RpcProvider | null = null;
let cachedAccount: Account | null = null;

function createMockPrivateTransfers(): PrivateTransfersInterface {
  return {
    build: () => {
      const builder: TransferBuilder = {
        with: () => builder,
        surplusTo: () => builder,
        createProofInvocation: async () => ({ mock: true }),
        execute: async () => ({
          call: { contractAddress: '0x0', entrypoint: 'mock', calldata: [] },
          proof: { proofFacts: [], data: '0xmockproof' },
        }),
      };
      return builder;
    },
    executeWithInvocation: async () => ({
      callAndProof: {
        call: { contractAddress: '0x0', entrypoint: 'mock', calldata: [] },
        proof: { proofFacts: [], data: '0xmockproof' },
      },
    }),
  };
}

export function getStarknetProvider(): RpcProvider {
  if (cachedProvider) return cachedProvider;

  const config = getStrk20Config();
  cachedProvider = new RpcProvider({ nodeUrl: config.rpcUrl });
  return cachedProvider;
}

export function getStarknetAccount(): Account {
  if (cachedAccount) return cachedAccount;

  const config = getStrk20Config();
  const provider = getStarknetProvider();

  cachedAccount = new Account({
    provider,
    address: config.accountAddress,
    signer: config.accountPrivateKey,
    cairoVersion: '1',
  });

  return cachedAccount;
}

export function getPrivateTransfers(): PrivateTransfersInterface {
  if (cachedTransfers) return cachedTransfers;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sdk = require('starknet-privacy');
    if (sdk && typeof sdk.createPrivateTransfers === 'function') {
      const config = getStrk20Config();
      const account = getStarknetAccount();
      cachedTransfers = sdk.createPrivateTransfers({
        account,
        viewingKeyProvider: { getViewingKey: async () => config.viewingKey },
        provingProvider: {
          url: config.provingServiceUrl,
          chainId: config.chainId,
        },
        discoveryProvider: {
          url: config.indexerUrl,
        },
        poolContractAddress: config.poolAddress,
      });
      return cachedTransfers!;
    }
  } catch {
    // Fall back to mock client in local dev mode
  }

  cachedTransfers = createMockPrivateTransfers();
  return cachedTransfers;
}

export async function getProvingBlockId(): Promise<number> {
  const provider = getStarknetProvider();
  try {
    const blockNumber = await provider.getBlockNumber();
    return blockNumber - PROVING_BLOCK_OFFSET;
  } catch {
    return 100000;
  }
}

export function resetStarknetClient(): void {
  cachedTransfers = null;
  cachedProvider = null;
  cachedAccount = null;
}
