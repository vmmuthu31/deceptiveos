# STRK20 Integration — Module Issues

> **Parent Issue:** STRK20 Privacy Pool Integration
> **Deadline:** Aug 31, 2026 (STRK20 Hackathon)
> **Category:** Infra / Privacy Infrastructure

---

## Module 1: Environment & Config
**Labels:** `backend`, `infra`, `priority:high`
**Status:** In Progress

### Description
Set up typed environment configuration for all STRK20 infrastructure. Define env vars, create a config singleton, add DEV_MODE flag for mock vs real SDK.

### Acceptance Criteria
- [ ] `.env.local` template with all required vars
- [ ] `src/server/config/strk20.ts` typed config object
- [ ] Runtime validation of required env vars
- [ ] DEV_MODE flag to switch between mock and real providers
- [ ] STRK token address constant exported

### Files
- Create: `.env.local.example`
- Create: `src/server/config/strk20.ts`

---

## Module 2: SDK Client Singleton
**Labels:** `backend`, `infra`, `priority:high`
**Status:** Pending

### Description
Initialize the `starknet-privacy` SDK as a singleton. Wire up `createPrivateTransfers` with `RpcProvider`, `Account`, `ProvingServiceProofProvider`, and `IndexerDiscoveryProvider`.

### Acceptance Criteria
- [ ] `src/server/services/starknet/client.ts` exports singleton
- [ ] Handles 10-block maturity window (`provingBlockId = currentBlock - 10`)
- [ ] DEV_MODE uses `NoValidateProofProvider` + `ContractDiscoveryProvider`
- [ ] Real mode uses `ProvingServiceProofProvider` + `IndexerDiscoveryProvider`
- [ ] Error handling for connection failures

### Files
- Create: `src/server/services/starknet/client.ts`
- Depends on: Module 1

---

## Module 3: Shield (TX 1)
**Labels:** `backend`, `strk20`, `priority:medium`
**Status:** Pending

### Description
Implement the Shield operation: convert public STRK to shielded UTXOs via the privacy pool.

### Acceptance Criteria
- [ ] `src/server/services/starknet/shield.ts` exports `shieldStrk(amount: bigint)`
- [ ] Calls `transfers.build().with(STRK, t => t.deposit({ amount })).surplusTo(self).execute()`
- [ ] Submits proof via `account.execute(callAndProof.call, { tip: 0n, ...proofDetails })`
- [ ] Returns `{ txHash, utxoCommitment, status }`
- [ ] Handles insufficient balance errors

### Files
- Create: `src/server/services/starknet/shield.ts`
- Depends on: Module 2

---

## Module 4: Private Transfer / Bounty Funding (TX 2)
**Labels:** `backend`, `strk20`, `priority:medium`
**Status:** Pending

### Description
Implement private transfer for bounty funding. Transfer shielded STRK to researcher anonymously.

### Acceptance Criteria
- [ ] `src/server/services/starknet/transfer.ts` exports `privateTransfer(recipient, amount)`
- [ ] Calls `transfers.build({ autoRegister: true }).with(STRK, t => t.transfer({ recipient, amount })).execute()`
- [ ] `fundBountyFromShielded(bountyId, amount)` links to bounty service
- [ ] Returns `{ txHash, utxoCommitment, status }`

### Files
- Create: `src/server/services/starknet/transfer.ts`
- Depends on: Module 2

---

## Module 5: Unshield (TX 3)
**Labels:** `backend`, `strk20`, `priority:medium`
**Status:** Pending

### Description
Implement Unshield: convert shielded UTXOs back to public STRK.

### Acceptance Criteria
- [ ] `src/server/services/starknet/unshield.ts` exports `unshieldStrk(amount: bigint)`
- [ ] Calls `transfers.build().with(STRK, t => t.withdraw({ amount })).execute()`
- [ ] Returns `{ txHash, status }`
- [ ] Handles insufficient shielded balance errors

### Files
- Create: `src/server/services/starknet/unshield.ts`
- Depends on: Module 2

---

## Module 6: Treasury Service Rewrite
**Labels:** `backend`, `strk20`, `priority:medium`
**Status:** Pending

### Description
Rewrite `treasury.service.ts` to use real SDK calls instead of JSON math.

### Acceptance Criteria
- [ ] `executeTreasuryTransaction()` calls real SDK functions
- [ ] `SHIELD` → calls `shieldStrk()`
- [ ] `UNSHIELD` → calls `unshieldStrk()`
- [ ] `PRIVATE_TRANSFER` → calls `privateTransfer()`
- [ ] Input validation with Zod schemas
- [ ] Balance checks before operations
- [ ] Real `txHash` and `utxoCommitment` from SDK

### Files
- Modify: `src/server/services/treasury.service.ts`
- Depends on: Modules 3, 4, 5

---

## Module 7: Bounty Service Rewrite
**Labels:** `backend`, `strk20`, `priority:medium`
**Status:** Pending

### Description
Rewrite `bounty.service.ts` to validate balances and execute real payments.

### Acceptance Criteria
- [ ] `fundGhostBounty()` validates `rewardStrk <= availableShieldedStrk`
- [ ] `fundGhostBounty()` calls `fundBountyFromShielded()`
- [ ] `claimGhostBounty()` calls `privateTransfer()` to pay researcher
- [ ] Real `txHash` linked to bounty
- [ ] Treasury balance updated on claim

### Files
- Modify: `src/server/services/bounty.service.ts`
- Depends on: Modules 4, 6

---

## Dependency Graph

```
Module 1 (Config)
    │
    ▼
Module 2 (SDK Client)
    │
    ├──► Module 3 (Shield)
    │
    ├──► Module 4 (Private Transfer)
    │
    └──► Module 5 (Unshield)
            │
            ▼
    Module 6 (Treasury Rewrite)
            │
            ▼
    Module 7 (Bounty Rewrite)
```
