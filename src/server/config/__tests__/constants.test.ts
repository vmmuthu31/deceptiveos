import { describe, it, expect } from 'vitest';
import { STRK_TOKEN_ADDRESS, PROVING_BLOCK_OFFSET, V3_TX_TIP, POOL_CLASS_HASH } from '../constants';

describe('STRK20 constants', () => {
  it('should have valid STRK token address', () => {
    expect(STRK_TOKEN_ADDRESS).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it('should have proving block offset of 10', () => {
    expect(PROVING_BLOCK_OFFSET).toBe(10);
  });

  it('should have V3 transaction tip of 0n', () => {
    expect(V3_TX_TIP).toBe(0n);
  });

  it('should have valid pool class hash', () => {
    expect(POOL_CLASS_HASH).toMatch(/^0x[0-9a-fA-F]{63,64}$/);
  });
});
