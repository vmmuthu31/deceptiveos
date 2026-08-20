import { describe, it, expect } from 'vitest';
import { Strk20EnvSchema } from '../env.schema';

describe('Strk20EnvSchema', () => {
  it('should validate a complete env object', () => {
    const validEnv = {
      RPC_URL: 'https://starknet-mainnet.public.blastapi.io',
      ACCOUNT_ADDRESS: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      ACCOUNT_PRIVATE_KEY: '0x1234567890abcdef',
      VIEWING_KEY: '12345678901234567890',
      PROVING_SERVICE_URL: 'https://prover.example.com',
      INDEXER_URL: 'https://indexer.example.com',
      POOL_ADDRESS: '0x0123456789abcdef',
      CHAIN_ID: '0x534e5f4d41494e',
      DEV_MODE: 'true',
    };

    const result = Strk20EnvSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('should fail when RPC_URL is missing', () => {
    const invalidEnv = {
      ACCOUNT_ADDRESS: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      ACCOUNT_PRIVATE_KEY: '0x1234567890abcdef',
      VIEWING_KEY: '12345678901234567890',
      PROVING_SERVICE_URL: 'https://prover.example.com',
      INDEXER_URL: 'https://indexer.example.com',
      POOL_ADDRESS: '0x0123456789abcdef',
      CHAIN_ID: '0x534e5f4d41494e',
    };

    const result = Strk20EnvSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
  });

  it('should fail when CHAIN_ID is invalid format', () => {
    const invalidEnv = {
      RPC_URL: 'https://starknet-mainnet.public.blastapi.io',
      ACCOUNT_ADDRESS: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      ACCOUNT_PRIVATE_KEY: '0x1234567890abcdef',
      VIEWING_KEY: '12345678901234567890',
      PROVING_SERVICE_URL: 'https://prover.example.com',
      INDEXER_URL: 'https://indexer.example.com',
      POOL_ADDRESS: '0x0123456789abcdef',
      CHAIN_ID: 'not-a-hex',
    };

    const result = Strk20EnvSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
  });

  it('should default DEV_MODE to false when not provided', () => {
    const envWithoutDevMode = {
      RPC_URL: 'https://starknet-mainnet.public.blastapi.io',
      ACCOUNT_ADDRESS: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      ACCOUNT_PRIVATE_KEY: '0x1234567890abcdef',
      VIEWING_KEY: '12345678901234567890',
      PROVING_SERVICE_URL: 'https://prover.example.com',
      INDEXER_URL: 'https://indexer.example.com',
      POOL_ADDRESS: '0x0123456789abcdef',
      CHAIN_ID: '0x534e5f4d41494e',
    };

    const result = Strk20EnvSchema.safeParse(envWithoutDevMode);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.DEV_MODE).toBe(false);
    }
  });

  it('should transform DEV_MODE string to boolean', () => {
    const envWithDevModeTrue = {
      RPC_URL: 'https://starknet-mainnet.public.blastapi.io',
      ACCOUNT_ADDRESS: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      ACCOUNT_PRIVATE_KEY: '0x1234567890abcdef',
      VIEWING_KEY: '12345678901234567890',
      PROVING_SERVICE_URL: 'https://prover.example.com',
      INDEXER_URL: 'https://indexer.example.com',
      POOL_ADDRESS: '0x0123456789abcdef',
      CHAIN_ID: '0x534e5f4d41494e',
      DEV_MODE: 'false',
    };

    const result = Strk20EnvSchema.safeParse(envWithDevModeTrue);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.DEV_MODE).toBe(false);
    }
  });
});
