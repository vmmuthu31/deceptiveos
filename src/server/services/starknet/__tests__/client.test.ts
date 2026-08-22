import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetStarknetClient } from '../client';

vi.mock('starknet', () => ({
  Account: vi.fn().mockImplementation(() => ({})),
  RpcProvider: vi.fn().mockImplementation(() => ({
    getBlockNumber: vi.fn().mockResolvedValue(100),
  })),
  constants: {
    StarknetChainId: {
      SN_MAIN: '0x534e5f4d41494e',
      SN_SEPOLIA: '0x534e5f494e544547524154494f4e5f5345504f4c4941',
    },
  },
}));

vi.mock('starknet-privacy', () => ({
  createPrivateTransfers: vi.fn().mockImplementation(() => ({
    build: vi.fn().mockReturnThis(),
    with: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue({}),
  })),
}));

describe('Starknet Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.RPC_URL = 'https://starknet-mainnet.public.blastapi.io';
    process.env.ACCOUNT_ADDRESS = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
    process.env.ACCOUNT_PRIVATE_KEY = '0x1234567890abcdef';
    process.env.VIEWING_KEY = '12345678901234567890';
    process.env.PROVING_SERVICE_URL = 'https://prover.example.com';
    process.env.INDEXER_URL = 'https://indexer.example.com';
    process.env.POOL_ADDRESS = '0x0123456789abcdef';
    process.env.CHAIN_ID = '0x534e5f4d41494e';
    resetStarknetClient();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetStarknetClient();
  });

  it('should export getPrivateTransfers function', async () => {
    const { getPrivateTransfers } = await import('../client');
    expect(typeof getPrivateTransfers).toBe('function');
  });

  it('should export getStarknetProvider function', async () => {
    const { getStarknetProvider } = await import('../client');
    expect(typeof getStarknetProvider).toBe('function');
  });

  it('should export getStarknetAccount function', async () => {
    const { getStarknetAccount } = await import('../client');
    expect(typeof getStarknetAccount).toBe('function');
  });

  it('should export getProvingBlockId function', async () => {
    const { getProvingBlockId } = await import('../client');
    expect(typeof getProvingBlockId).toBe('function');
  });

  it('should export resetStarknetClient function', async () => {
    const { resetStarknetClient } = await import('../client');
    expect(typeof resetStarknetClient).toBe('function');
  });

  it('should create provider when getStarknetProvider is called', async () => {
    const { getStarknetProvider } = await import('../client');
    const provider = getStarknetProvider();
    expect(provider).toBeDefined();
  });

  it('should cache provider on subsequent calls', async () => {
    const { getStarknetProvider } = await import('../client');
    const provider1 = getStarknetProvider();
    const provider2 = getStarknetProvider();
    expect(provider1).toBe(provider2);
  });

  it('should create account when getStarknetAccount is called', async () => {
    const { getStarknetAccount } = await import('../client');
    const account = getStarknetAccount();
    expect(account).toBeDefined();
  });

  it('should create transfers when getPrivateTransfers is called', async () => {
    const { getPrivateTransfers } = await import('../client');
    const transfers = getPrivateTransfers();
    expect(transfers).toBeDefined();
  });

  it('should cache transfers on subsequent calls', async () => {
    const { getPrivateTransfers } = await import('../client');
    const transfers1 = getPrivateTransfers();
    const transfers2 = getPrivateTransfers();
    expect(transfers1).toBe(transfers2);
  });

  it('should calculate proving block ID correctly', async () => {
    const { getProvingBlockId } = await import('../client');
    const blockId = await getProvingBlockId();
    expect(blockId).toBe(90);
  });

  it('should reset client state', async () => {
    const { getPrivateTransfers, resetStarknetClient } = await import('../client');
    const transfers1 = getPrivateTransfers();
    resetStarknetClient();
    const transfers2 = getPrivateTransfers();
    expect(transfers1).not.toBe(transfers2);
  });
});
