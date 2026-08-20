import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getStrk20Config, resetStrk20Config } from '../strk20';

describe('getStrk20Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetStrk20Config();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetStrk20Config();
  });

  it('should return typed config when env vars are valid', () => {
    process.env.RPC_URL = 'https://starknet-mainnet.public.blastapi.io';
    process.env.ACCOUNT_ADDRESS = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
    process.env.ACCOUNT_PRIVATE_KEY = '0x1234567890abcdef';
    process.env.VIEWING_KEY = '12345678901234567890';
    process.env.PROVING_SERVICE_URL = 'https://prover.example.com';
    process.env.INDEXER_URL = 'https://indexer.example.com';
    process.env.POOL_ADDRESS = '0x0123456789abcdef';
    process.env.CHAIN_ID = '0x534e5f4d41494e';
    process.env.DEV_MODE = 'true';

    const config = getStrk20Config();

    expect(config.rpcUrl).toBe('https://starknet-mainnet.public.blastapi.io');
    expect(config.accountAddress).toBe('0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d');
    expect(config.devMode).toBe(true);
    expect(config.chainId).toBe('0x534e5f4d41494e');
    expect(config.viewingKey).toBe(12345678901234567890n);
  });

  it('should throw when required env vars are missing', () => {
    delete process.env.RPC_URL;

    expect(() => getStrk20Config()).toThrow('Invalid STRK20 environment variables');
  });

  it('should cache config after first call', () => {
    process.env.RPC_URL = 'https://starknet-mainnet.public.blastapi.io';
    process.env.ACCOUNT_ADDRESS = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
    process.env.ACCOUNT_PRIVATE_KEY = '0x1234567890abcdef';
    process.env.VIEWING_KEY = '12345678901234567890';
    process.env.PROVING_SERVICE_URL = 'https://prover.example.com';
    process.env.INDEXER_URL = 'https://indexer.example.com';
    process.env.POOL_ADDRESS = '0x0123456789abcdef';
    process.env.CHAIN_ID = '0x534e5f4d41494e';

    const config1 = getStrk20Config();
    const config2 = getStrk20Config();

    expect(config1).toBe(config2);
  });
});
