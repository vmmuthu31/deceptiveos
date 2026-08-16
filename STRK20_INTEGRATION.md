# CipherNest: STRK20 Technical Integration Specification

> **STRK20 Private Sprint Hackathon Architecture Document**
> *Target Category: Infra / Privacy Infrastructure*
> *Starknet Contract Address:* `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`

---

## 1. Problem Thesis & Why STRK20

Traditional Cyber Threat Intelligence (CTI) sharing is broken due to a fundamental privacy dilemma:

1. **Victims cannot disclose attacks publicly**: Organization A gets attacked, but publishing raw incident telemetry or funding a threat bounty publicly leaks that Company A was breached.
2. **Researchers risk attribution**: Security researchers discovering C2 infrastructure cannot claim public bounties without linking their wallet identity to threat actor targets.
3. **Fragmented Defense**: Organizations remain isolated, allowing autonomous AI attack agents to reuse the same TTPs across multiple targets without early correlation.

### The Solution: CipherNest STRK20 Economic Coordination Layer
CipherNest uses **Starknet STRK20 Zero-Knowledge Shielded Balances and Private Transfers** to decouple threat intelligence funding from organizational and wallet identity.

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

## 2. The 3 Economic Roles

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

1. **Defender (Funder)**: Traps autonomous attackers in AI digital twins, extracts Attacker DNA (`DNA: 7F-A2-91`), and funds a GhostBounty in shielded STRK20. The defender's wallet address and organization identity remain completely hidden on-chain.
2. **Researcher (Claimant)**: Discovers matching threat intelligence (C2 IP addresses, payload signatures, campaign targets) and claims the bounty anonymously. STRK20 transfers shielded tokens directly to the researcher's private balance.
3. **Intelligence Network (Receiver)**: Receives anonymized, zero-knowledge threat correlation signatures that protect all participating defenders against identical autonomous AI attack campaigns.

---

## 3. Privacy Threat Model & Guarantees

| Data Element | Public On-Chain | Private Shielded (CipherNest + STRK20) |
| :--- | :--- | :--- |
| **Defender Identity / Wallet** | ❌ HIPP/SOC 2 Shielded | ✓ 100% Anonymous |
| **Attacker DNA Fingerprint** | ✓ Commitment Hash (`7F-A2-91`) | Raw telemetry kept local |
| **Bounty Amount (STRK)** | ✓ Public Escrow Commitment | UTXO Shielded Note |
| **Researcher Wallet Address** | ❌ Hidden | ✓ Encrypted Note Transfer |
| **Raw C2 / Payload Intel** | ❌ Hidden | Verified via ZK Proof |

---

## 4. STRK20 Transaction Lifecycle

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

## 5. Judge Execution & Reproduction Guide

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

## 6. Project Verification Summary

- **ESLint & TypeScript**: `bun run lint` (`tsc --noEmit && eslint .`) ➔ **Passed (0 Errors, 0 Warnings)**.
- **Metadata Spec**: [`strk20.json`](./strk20.json) (Category: `Infra`).
- **Mainnet Contract**: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`.
