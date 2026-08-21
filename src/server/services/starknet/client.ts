import { Account, RpcProvider, constants } from 'starknet';
import { createPrivateTransfers, type PrivateTransfersInterface } from 'starknet-privacy';
import { CallMockProofProvider, ContractDiscoveryProvider } from 'starknet-privacy/testing';
import { getStrk20Config } from '@/server/config/strk20';
import { PROVING_BLOCK_OFFSET } from '@/server/config/constants';

let cachedTransfers: PrivateTransfersInterface | null = null;
let cachedProvider: RpcProvider | null = null;
let cachedAccount: Account | null = null;

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

  const config = getStrk20Config();
  const account = getStarknetAccount();

  const chainId = config.chainId === '0x534e5f4d41494e'
    ? constants.StarknetChainId.SN_MAIN
    : constants.StarknetChainId.SN_SEPOLIA;

  if (config.devMode) {
    const provider = getStarknetProvider();
    cachedTransfers = createPrivateTransfers({
      account,
      viewingKeyProvider: { getViewingKey: async () => config.viewingKey },
      provingProvider: new CallMockProofProvider(provider, chainId),
      discoveryProvider: new ContractDiscoveryProvider(
        { getAddress: async () => config.poolAddress } as never,
      ),
      poolContractAddress: config.poolAddress,
    });
  } else {
    cachedTransfers = createPrivateTransfers({
      account,
      viewingKeyProvider: { getViewingKey: async () => config.viewingKey },
      provingProvider: {
        url: config.provingServiceUrl,
        chainId,
      },
      discoveryProvider: {
        url: config.indexerUrl,
      },
      poolContractAddress: config.poolAddress,
    });
  }

  return cachedTransfers;
}

export async function getProvingBlockId(): Promise<number> {
  const provider = getStarknetProvider();
  const blockNumber = await provider.getBlockNumber();
  return blockNumber - PROVING_BLOCK_OFFSET;
}

export function resetStarknetClient(): void {
  cachedTransfers = null;
  cachedProvider = null;
  cachedAccount = null;
}
