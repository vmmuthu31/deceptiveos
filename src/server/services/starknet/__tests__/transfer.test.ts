import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('starknet', () => ({
  Account: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({ transaction_hash: '0xtx_hash' }),
  })),
  RpcProvider: vi.fn().mockImplementation(() => ({
    getBlockNumber: vi.fn().mockResolvedValue(100),
    waitForTransaction: vi.fn().mockResolvedValue({ isSuccess: () => true, block_number: 95 }),
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
    build: vi.fn().mockReturnValue({
      surplusTo: vi.fn().mockReturnThis(),
      with: vi.fn().mockReturnThis(),
      createProofInvocation: vi.fn().mockResolvedValue({}),
    }),
    executeWithInvocation: vi.fn().mockResolvedValue({
      callAndProof: {
        call: { contractAddress: '0x1', entrypoint: 'apply_actions', calldata: [] },
        proof: {
          data: 'base64proof',
          output: ['0xclass'],
          proofFacts: ['0xfact1'],
        },
      },
    }),
  })),
}));

describe('privateTransfer', () => {
  const originalEnv = process.env;
  const mockRecipient = '0x0000000000000000000000000000000000000000000000000000000000000001';

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.RPC_URL = 'https://starknet-sepolia.public.blastapi.io';
    process.env.ACCOUNT_ADDRESS = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
    process.env.ACCOUNT_PRIVATE_KEY = '0x1234567890abcdef';
    process.env.VIEWING_KEY = '12345678901234567890';
    process.env.PROVING_SERVICE_URL = 'https://prover.example.com';
    process.env.INDEXER_URL = 'https://indexer.example.com';
    process.env.POOL_ADDRESS = '0x0123456789abcdef';
    process.env.CHAIN_ID = '0x534e5f494e544547524154494f4e5f5345504f4c4941';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should export privateTransfer function', async () => {
    const { privateTransfer } = await import('../transfer');
    expect(typeof privateTransfer).toBe('function');
  });

  it('should throw on zero amount', async () => {
    const { privateTransfer } = await import('../transfer');
    await expect(privateTransfer(mockRecipient, 0n)).rejects.toThrow('Transfer amount must be positive');
  });

  it('should throw on invalid recipient', async () => {
    const { privateTransfer } = await import('../transfer');
    await expect(privateTransfer('not-hex', 100n)).rejects.toThrow('Invalid recipient address');
  });

  it('should return correct result shape', async () => {
    const { privateTransfer } = await import('../transfer');
    const result = await privateTransfer(mockRecipient, 500n);
    expect(result).toHaveProperty('txHash');
    expect(result).toHaveProperty('blockNumber');
    expect(result).toHaveProperty('recipient');
    expect(result).toHaveProperty('amount');
    expect(result).toHaveProperty('status');
    expect(result.amount).toBe(500n);
    expect(result.recipient).toBe(mockRecipient);
    expect(result.status).toBe('CONFIRMED');
  });
});
