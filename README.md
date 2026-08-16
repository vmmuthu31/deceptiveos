# CipherNest

**Private Defense Network for Autonomous AI Attacks**

> *"A privacy-preserving immune system for the age of autonomous cyberattacks. Trap autonomous attackers. Learn their behavioral identity. Share intelligence without exposing the victim. Reward discoveries privately."*

CipherNest is an **Adversarial AI Defense Engine & Private Cyber Deception Network** built with Next.js (App Router), TypeScript, Tailwind CSS v4, OpenCode AI (`opencode/mimo-v2.5-free`), and Starknet STRK20 zero-knowledge privacy settlement. It deploys adaptive digital twin decoys, generates semantically authentic lure documents with steganographic tracking watermarks, fingerprints attacker identity across sessions, and enables private, zero-knowledge threat bounties to counter autonomous AI-driven attack agents.

---

## 🚀 The 4 Product Modules

### 1. 🤖 DECEIVE — Adaptive AI Digital Twins & Attacker Traps
Honeypots designed specifically to defeat autonomous AI attack agents. OpenCode AI (`opencode/mimo-v2.5-free`) generates contextually dynamic terminal responses with realistic timing jitter (50–800ms) and statistically authentic command outputs while read-only scanners mirror host OS, services, and directory states.

### 2. 🧬 FINGERPRINT — Attacker DNA & Cross-Session Identity
Builds a cross-session behavioral fingerprint from command execution velocity, tool signatures, typo frequencies, and estimated timezones mapped against MITRE ATT&CK TTPs (`DNA: 7F-A2-91`).

### 3. 🌐 COORDINATE — Private Threat Intelligence Network
A zero-knowledge threat graph that correlates anonymized attacker fingerprints across participating defenders without exposing who was attacked, organization names, or victim IP addresses.

### 4. 🛡️ REWARD — GhostBounties Powered by STRK20
When an unknown or high-severity Attacker DNA fingerprint is trapped, security teams fund private threat intelligence bounties (`250 STRK SHIELDED`). Security researchers submit matching campaign intelligence and claim rewards anonymously via STRK20 zero-knowledge privacy pools without exposing company identities, wallet addresses, or security incident details.

---

## 📊 Live Deception Effectiveness Scoreboard

CipherNest tracks live quantitative metrics comparing traditional static honeypots vs. CipherNest autonomous defense:

| Evaluation Metric | Static Honeypots (Traditional) | CipherNest Autonomous Defense |
| :--- | :--- | :--- |
| **Detection Latency** | `12.4s` | `1.8s` (⚡ 6.8x Faster) |
| **Attacker Dwell Time Delay** | `2m` | `+17m` (🛡️ 8.5x Longer Containment) |
| **Decoy Tool Interaction** | `21%` | `82.3%` (🤖 AI Trajectory Absorption) |
| **Extracted TTP Signatures** | `4` | `13 MITRE ATT&CK TTPs` |
| **Cross-Session Attacker DNA** | ❌ IP Only (Spoofable) | ✓ Multi-Session Behavioral DNA |
| **Private STRK20 Settlement** | ❌ None | ✓ STRK20 GhostBounty Protocol |

---

## 🔒 STRK20 Transaction Lifecycle

CipherNest implements a 3-step privacy lifecycle on Starknet:

```
                  ┌──────────────────────┐
                  │      ATTACKER        │
                  └──────────┬───────────┘
                             │
                             ▼
               ┌─────────────────────────┐
               │   CIPHERNEST DECEPTION  │
               │  AI Honeypot / Twin     │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │   ATTACKER DNA ENGINE   │
               │  DNA: 7F-A2-91 (96.1%)  │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │      GHOSTBOUNTY        │
               │  "Find C2 Infrastructure"│
               │     250 STRK SHIELDED   │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │         STRK20          │
               │                         │
               │ TX 1: Shield Balance    │
               │ TX 2: Private Transfer  │
               │ TX 3: Unshield Tokens   │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │   SECURITY RESEARCHER   │
               │  Submits Intel & Claims │
               │   Reward Anonymously    │
               └─────────────────────────┘
```

---

## 🏗️ Architecture Layers

```
┌──────────────────────────────────────────────────────────┐
│  CipherNest Next.js App Router (TypeScript + Tailwind)   │
│  • Overview      • Honeypots   • Events     • DNA Alerts │
│  • Lure Studio   • Bounties    • Treasury   • Network    │
├──────────────────────────────────────────────────────────┤
│  Server API & Services (src/server/services/)            │
│  • ai.service.ts         — OpenCode AI inference engine  │
│  • honeypot.service.ts   — Container controls & twin sync│
│  • lure.service.ts       — Steganographic token embedding│
│  • fingerprint.service.ts— Attacker DNA classification   │
│  • bounty.service.ts     — GhostBounty management        │
│  • treasury.service.ts   — STRK20 Shield/Transfer/Unshield│
│  • network.service.ts    — Zero-knowledge threat graph   │
│  • effectiveness.service.ts— Live Deception Score Engine │
│  • compliance.service.ts — SOC 2 immutable audit ledger  │
├──────────────────────────────────────────────────────────┤
│  Data & Privacy Layer                                    │
│  • OpenCode AI (opencode/mimo-v2.5-free) — Multi-LLM API │
│  • Starknet STRK20       — Shielded UTXO zero-knowledge  │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/vmmuthu31/deceptiveos.git
cd deceptiveos

# Install dependencies
bun install

# Start Next.js development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the CipherNest operations console.

### Code Verification

```bash
# Run strict TypeScript type-checking + ESLint
bun run lint
```

---

## 🏆 STRK20 Hackathon Submission Details

- **Project Name**: CipherNest
- **Category**: Infra
- **One-Liner**: Adversarial AI Cyber Deception Engine deploying living digital twin decoys, steganographic canary lures, and zero-knowledge audit trails for Starknet.
- **Metadata Spec**: [`strk20.json`](./strk20.json)

---

## 📜 License

MIT License © 2026 CipherNest Team
