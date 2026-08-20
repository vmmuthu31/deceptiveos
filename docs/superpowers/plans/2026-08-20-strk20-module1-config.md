# STRK20 Module 1: Environment & Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up typed environment configuration for all STRK20 infrastructure — env vars, config singleton, DEV_MODE flag, and constants.

**Architecture:** Single config module that validates env vars at startup, exports typed config object, and provides a DEV_MODE flag to switch between mock and real SDK providers. No external dependencies beyond Node.js built-ins.

**Tech Stack:** TypeScript, Node.js `process.env`, Zod (already in project)

## Global Constraints

- Node.js >= 18 (project uses Next.js 15)
- TypeScript strict mode (`tsconfig.json`)
- No `any` types (AGENTS.md mandate)
- Zod validation for all schemas (AGENTS.md mandate)
- Follow existing code patterns in `src/server/`

---

### Task 1: Create `.env.local.example` template

**Files:**
- Create: `.env.local.example`

**Interfaces:**
- Consumes: None (first task)
- Produces: Environment variable template for all STRK20 infrastructure

- [ ] **Step 1: Create the env template**

```bash
# STRK20 Privacy Pool Configuration
# Copy to .env.local and fill in values

# Starknet RPC endpoint (required)
# Public: https://starknet-mainnet.public.blastapi.io
# Or use Infura/Alchemy for reliability
RPC_URL=

# Account credentials (required for real transactions)
# Generate with starknet CLI or import from wallet
ACCOUNT_ADDRESS=
ACCOUNT_PRIVATE_KEY=

# Viewing key for note discovery (required)
# Must be a BigInt value (e.g., 12345678901234567890)
VIEWING_KEY=

# Proving service URL (required for real proofs)
# Starkware: https://prover.privacy-starknet-integration.starknet.io
# Or run locally: docker run -p 3000:3000 ghcr.io/starkware-libs/starknet-privacy/transaction-prover:PRIVACY-0.14.3-RC.2
PROVING_SERVICE_URL=

# Discovery/indexer service URL (required for note discovery)
# Starkware: https://indexer.privacy-starknet-integration.starknet.io
# Or run locally: docker run -p 8080:8080 ghcr.io/starkware-libs/starknet-privacy/discovery-service:PRIVACY-0.14.3-RC.2
INDEXER_URL=

# Privacy pool contract address (required)
# This is the deployed pool on Starknet (NOT the STRK token address)
# TODO: Get from hackathon Telegram or deploy own
POOL_ADDRESS=

# Chain ID (required)
# Mainnet: 0x534e5f4d41494e
# Testnet: 0x534e5f494e544547524154494f4e5f5345504f4c4941
CHAIN_ID=0x534e5f4d41494e

# Development mode (optional)
# Set to "true" to use mock providers (NoValidateProofProvider + ContractDiscoveryProvider)
# Set to "false" or omit for real SDK providers
DEV_MODE=true
```

- [ ] **Step 2: Verify the template is complete**

Run: `cat .env.local.example | grep -c "^#"`
Expected: Count of comment lines (should be ~20+)

- [ ] **Step 3: Commit**

```bash
git add .env.local.example
git commit -m "feat(strk20): add env template for Module 1 config"
```

---

### Task 2: Create Zod validation schema for env vars

**Files:**
- Create: `src/server/config/env.schema.ts`

**Interfaces:**
- Consumes: `.env.local.example` (defines what vars exist)
- Produces: `Strk20EnvSchema` Zod schema, `Strk20Env` TypeScript type

- [ ] **Step 1: Write the failing test**

```typescript
// src/server/config/__tests__/env.schema.test.ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/server/config/__tests__/env.schema.test.ts`
Expected: FAIL with "Cannot find module '../env.schema'"

- [ ] **Step 3: Write the schema implementation**

```typescript
// src/server/config/env.schema.ts
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
  DEV_MODE: z.string().transform((val) => val === 'true').default('false'),
});

export type Strk20Env = z.infer<typeof Strk20EnvSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/server/config/__tests__/env.schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/config/env.schema.ts src/server/config/__tests__/env.schema.test.ts
git commit -m "feat(strk20): add Zod schema for env validation"
```

---

### Task 3: Create typed config singleton

**Files:**
- Create: `src/server/config/strk20.ts`

**Interfaces:**
- Consumes: `Strk20EnvSchema` from Task 2
- Produces: `getStrk20Config()` function returning typed config

- [ ] **Step 1: Write the failing test**

```typescript
// src/server/config/__tests__/strk20.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getStrk20Config } from '../strk20';

describe('getStrk20Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/server/config/__tests__/strk20.test.ts`
Expected: FAIL with "Cannot find module '../strk20'"

- [ ] **Step 3: Write the config implementation**

```typescript
// src/server/config/strk20.ts
import { Strk20EnvSchema, type Strk20Env } from './env.schema';

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
    const errors = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/server/config/__tests__/strk20.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/config/strk20.ts src/server/config/__tests__/strk20.test.ts
git commit -m "feat(strk20): add typed config singleton with validation"
```

---

### Task 4: Add STRK20 constants

**Files:**
- Create: `src/server/config/constants.ts`

**Interfaces:**
- Consumes: None (constants only)
- Produces: Exported constants for STRK20 integration

- [ ] **Step 1: Write the failing test**

```typescript
// src/server/config/__tests__/constants.test.ts
import { describe, it, expect } from 'vitest';
import { STRK_TOKEN_ADDRESS, PROVING_BLOCK_OFFSET, V3_TX_TIP } from '../constants';

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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/server/config/__tests__/constants.test.ts`
Expected: FAIL with "Cannot find module '../constants'"

- [ ] **Step 3: Write the constants implementation**

```typescript
// src/server/config/constants.ts

/** STRK token address on Starknet mainnet */
export const STRK_TOKEN_ADDRESS = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

/** Number of blocks to wait before proving (maturity window) */
export const PROVING_BLOCK_OFFSET = 10;

/** V3 transaction tip (required for privacy pool transactions) */
export const V3_TX_TIP = 0n;

/** Privacy pool class hash */
export const POOL_CLASS_HASH = '0x52107fadffab71bdcbb6b2ccb68ba3e1b5558d94036538053e159d3076ad633';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/server/config/__tests__/constants.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/config/constants.ts src/server/config/__tests__/constants.test.ts
git commit -m "feat(strk20): add STRK20 constants"
```

---

### Task 5: Verify all tests pass together

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: Tasks 1-4
- Produces: All tests passing

- [ ] **Step 1: Run all config tests**

Run: `bun test src/server/config/__tests__/`
Expected: All 10+ tests pass

- [ ] **Step 2: Run lint**

Run: `bun run lint`
Expected: No errors

- [ ] **Step 3: Final commit if needed**

```bash
git add -A
git commit -m "feat(strk20): Module 1 complete - env config ready"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All acceptance criteria covered in tasks
- [x] **Placeholder scan:** No TBD/TODO placeholders in implementation code
- [x] **Type consistency:** `Strk20Env` type flows from schema → config → consumers
- [x] **Test coverage:** Schema validation, config loading, constants all tested
- [x] **Error handling:** Clear error messages when env vars are missing/invalid

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-20-strk20-module1-config.md`. Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
