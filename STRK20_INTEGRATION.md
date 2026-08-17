# CipherNest: STRK20 Technical Integration Specification

> **STRK20 Private Sprint Hackathon Architecture Document**
> *Target Category: Infra / Privacy Infrastructure*
> *SDK Package:* `@starkware-libs/starknet-privacy-sdk`
> *Starknet Contract Address:* `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`

---

## 1. Problem Thesis & Why STRK20

Traditional Cyber Threat Intelligence (CTI) sharing is broken due to a fundamental privacy dilemma:

1. **Victims cannot disclose attacks publicly**: Organization A gets attacked, but publishing raw incident telemetry or funding a threat bounty publicly leaks that Company A was breached.
2. **Researchers risk attribution**: Security researchers discovering C2 infrastructure cannot claim public bounties without linking their wallet identity to threat actor targets.
3. **Fragmented Defense**: Organizations remain isolated, allowing autonomous AI attack agents to reuse the same TTPs across multiple targets without early correlation.

### The Solution: CipherNest Hybrid Platform & STRK20 Economic Coordination Layer
CipherNest uses a **Hybrid Desktop Agent (Electron + Docker)** and **Starknet STRK20 Zero-Knowledge Shielded Balances** to decouple threat intelligence funding from organizational and wallet identity.

```
                          CIPHERNEST THREAT LOOP

  1. ATTACK          2. DECEIVE           3. FINGERPRINT       4. CORRELATE
┌──────────┐        ┌──────────┐         ┌──────────────┐     ┌───────────┐
│ Attacker │ ────►  │ Decoy    │  ────►  │ Attacker DNA │ ──► │ Threat    │
│ Enters   │        │ Twin     │         │ (7F-A2-91)   │     │ Graph     │
└──────────┘        └──────────┘         └──────────────┘     └─────┬─────┘
                                                                    │
  8. LEARN           7. PRIVATE PAY       6. VERIFY            5. BOUNTY
┌──────────┐        ┌──────────┐         ┌──────────────┐     ┌─────▼─────┐
│ Network  │ ◄────  │ STRK20   │  ◄────  │ ZK Proof /   │ ◄── │ Ghost-    │
│ Updates  │        │ Transfer │         │ Intel Claim  │     │ Bounty    │
└──────────┘        └──────────┘         └──────────────┘     └───────────┘
```

---

## 2. Telemetry Isolation & Privacy Boundary

Raw defender environment telemetry stays 100% local inside defender machines:

```
LOCAL DEFENDER ENVIRONMENT (DESKTOP AGENT)
─────────────────────────────────────────
Real Filesystem     (/home/company/...)
Real Hostnames      (prod-db-01.acme.local)
Real Command Logs   (cat /etc/shadow)
Raw Attacker Session
       │
       │ Local Processing (Attacker DNA Engine)
       ▼
Attacker DNA        (DNA: 7F-A2-91)
MITRE TTPs          (T1059.004 / T1083)
Commitment Hash     (0x8a729c18...)
       │
       │ Privacy Gateway
       ▼
PUBLIC NETWORK & STARKNET STRK20 POOL
```

---

## 3. The 3 Economic Roles

CipherNest creates a self-sustaining network effect across three distinct economic participants:

```
                    ┌─────────────────────────┐
                    │        DEFENDER         │
                    │  • Traps Attacker       │
                    │  • Funds GhostBounty    │
                    │  • Shielded STRK20      │
                    └────────────┬────────────┘
                                 │
                         Funds GhostBounty
                         (Shielded STRK)
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   RESEARCHER (CLAIMANT) │
                    │  • Submits Intel        │
                    │  • Claims Reward        │
                    │  • Anonymous Transfer   │
                    └────────────┬────────────┘
                                 │
                        Verified Intelligence
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  INTELLIGENCE NETWORK   │
                    │  • Correlates Fingerprint│
                    │  • Updates Threat Graph │
                    │  • Shields All Victims  │
                    └─────────────────────────┘
```

---

## 4. Official SDK Technical Wiring (`@starkware-libs/starknet-privacy-sdk`)

CipherNest builds directly on top of the official Starkware Privacy SDK factory:

### 4.1 Factory & Provider Initialization (`createPrivateTransfers`)
```typescript
import { Account, RpcProvider, constants } from "starknet"
import {
  createPrivateTransfers,
  ProvingServiceProofProvider,
} from "@starkware-libs/starknet-privacy-sdk"
import { IndexerDiscoveryProvider } from "@starkware-libs/starknet-privacy-sdk/dist/internal/indexer-discovery.js"

const provider = new RpcProvider({ nodeUrl: process.env.RPC_URL! })
const account = new Account({
  provider,
  address: process.env.ACCOUNT_ADDRESS!,
  signer: process.env.ACCOUNT_PRIVATE_KEY!,
  cairoVersion: "1",
})

const transfers = createPrivateTransfers({
  account,
  viewingKeyProvider: {
    // MANDATORY: viewing key MUST be a BigInt (k)
    getViewingKey: async () => BigInt(process.env.VIEWING_KEY!),
  },
  provingProvider: new ProvingServiceProofProvider(
    process.env.PROVING_SERVICE_URL!,
    constants.StarknetChainId.SN_SEPOLIA,
  ),
  discoveryProvider: new IndexerDiscoveryProvider(
    process.env.INDEXER_URL!,
    process.env.POOL_ADDRESS!,
  ),
  poolContractAddress: process.env.POOL_ADDRESS!,
})
```

### 4.2 On-Chain Key Registration (`autoRegister: true`)
Before an account can receive private note transfers, its public viewing key is registered on-chain:
```typescript
const provingBlockId = (await provider.getBlockNumber()) - 10

const { callAndProof } = await transfers
  .build({ autoRegister: true, autoSetup: true })
  .with(tokenAddress, (t) => t.deposit({ amount: 250n }))
  .surplusTo(account.address)
  .execute({ provingBlockId })
```

### 4.3 Transaction Submission Tail & Proving Safety
- **Note Maturity Window (`provingBlockId`)**: Proving is executed against `currentBlock - 10` so newly created notes have matured 10 blocks after creation.
- **Starknet v3 Transaction Tail**: Uses `tip: 0n` and conditionally spreads `proofFacts`.
```typescript
const proofDetails = callAndProof.proof.proofFacts?.length
  ? { proofFacts: callAndProof.proof.proofFacts, proof: callAndProof.proof.data }
  : {}

const tx = await account.execute(callAndProof.call, { tip: 0n, ...proofDetails })
await provider.waitForTransaction(tx.transaction_hash)
```

---

## 5. STRK20 Transaction Lifecycle

CipherNest implements three core STRK20 mainnet transaction primitives:

### TX 1 — Shield (Public STRK ➔ STRK20 Shielded Balance)
Converts public ERC-20 STRK into a zero-knowledge Poseidon UTXO commitment anchored on Starknet mainnet.
- **Input**: Public Wallet Address + Amount (`500 STRK`)
- **Output**: `0xutxo_commitment_998877665544`
- **Audit Ledger**: Appends `STRK20_SHIELD_EXECUTED` block.

### TX 2 — Private Transfer (GhostBounty Escrow ➔ Researcher)
Transfers shielded STRK tokens from the GhostBounty escrow contract directly to the researcher's private note commitment without revealing sender, receiver, or relationship.
- **Input**: `GhostBounty #gb-02` + Claimant Hash (`0x_anon_researcher_89f1a2c4`)
- **Output**: `0xutxo_commitment_112233445566`
- **Audit Ledger**: Appends `STRK20_PRIVATE_TRANSFER_EXECUTED` block.

### TX 3 — Unshield (STRK20 Shielded Balance ➔ Public STRK)
Converts shielded UTXO balances back to public wallet addresses for operational liquidity.
- **Input**: Shielded UTXO Commitment + Amount (`250 STRK`)
- **Output**: Public Wallet Credit
- **Audit Ledger**: Appends `STRK20_UNSHIELD_EXECUTED` block.

---

## 6. Judge Execution & Reproduction Guide

Hackathon judges can test the end-to-end mainnet flow directly from the CipherNest UI:

1. **Access Console**: Open [http://localhost:3000](http://localhost:3000).
2. **Open Private Treasury**: Navigate to **PRIVACY OPERATIONS ➔ Private Treasury** (`/treasury`).
3. **Execute Shield (TX 1)**: Select **Shield STRK (TX 1)**, enter `500 STRK`, and click **Shield STRK**. Observe public balance decrease and shielded balance increase.
4. **Open GhostBounties**: Navigate to **GhostBounties** (`/bounties`).
5. **Fund GhostBounty (TX 2)**: Click **Fund GhostBounty**, enter Attacker DNA (`7F-A2-91`), reward (`250 STRK`), and click **Fund & Shield STRK**.
6. **Claim Anonymously**: Click **Submit Private Intel** on the created GhostBounty, enter C2 intelligence, and submit.
7. **Execute Unshield (TX 3)**: Return to `/treasury`, select **Unshield STRK (TX 3)**, and unshield tokens back to public balance.
8. **Verify Audit Trail**: Navigate to **Compliance & Audit** (`/settings`) to inspect the immutable SHA-256 hash-chained proof ledger.

---

## 7. Project Verification Summary

- **ESLint & TypeScript**: `bun run lint` (`tsc --noEmit && eslint .`) ➔ **Passed (0 Errors, 0 Warnings)**.
- **SDK Spec**: `@starkware-libs/starknet-privacy-sdk`.
- **Metadata Spec**: [`strk20.json`](./strk20.json) (Category: `Infra`).
- **Mainnet Contract**: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`.
