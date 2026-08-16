# CipherNest

**Private Cyber Defense Engine & STRK20 Shielded Deception Network**

> *"Protect the attacker intelligence. Pay, share, and coordinate security operations without exposing who is defending whom."*

CipherNest is an **Adversarial AI Defense Engine & Private Cyber Deception Network** built with Next.js (App Router), TypeScript, Tailwind CSS v4, local Ollama AI, and Starknet STRK20 zero-knowledge privacy settlement. It deploys living digital twin decoys, generates semantically authentic lure documents with steganographic tracking watermarks, fingerprints attacker identity across sessions, and enables private, zero-knowledge threat bounties to counter autonomous AI-driven attacks — all running entirely on your own machine.

---

## 🌟 Strategic Core Pillars

### 1. 🤖 AI Attacker Trap
Honeypots designed specifically to defeat autonomous AI attack agents. A local Ollama counter-LLM (`llama3.1:8b`) generates contextually dynamic responses with realistic timing jitter (50–800ms) and statistically authentic command outputs.

### 2. 🪞 Living Digital Twin Decoys
Automatically mirrors real infrastructure metadata (hostnames, directory trees, system configuration files, software packages) using read-only filesystem scanning so decoys remain indistinguishable from production nodes.

### 3. 🧬 Attacker DNA Fingerprinting
Builds a behavioral fingerprint from command execution velocity, tool signatures, typo frequencies, and estimated timezones mapped against MITRE ATT&CK TTPs.

### 4. 📄 Semantic Lure Generator & Steganographic Watermarks
Generates company-specific decoy documents (credentials, API keys, compensation spreadsheets) embedded with invisible steganographic whitespace signatures and HTTP callback beacons.

### 5. 🛡️ GhostBounties & STRK20 Shielded Settlement
When an unknown or high-severity Attacker DNA fingerprint (`DNA: 7F-A2-91`) is trapped, security teams can fund private threat intelligence bounties (`250 STRK SHIELDED`). Security researchers submit matching campaign intelligence and claim rewards anonymously via STRK20 zero-knowledge privacy pools without exposing company identities, wallet addresses, or security incident details.

### 6. 🌐 Private Attacker Network
A zero-knowledge threat graph that shares anonymized attacker fingerprints across participating defenders without exposing who was attacked or who owns the infrastructure.

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
               │  DNA: 7F-A2-91 (94.7%)  │
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
│  • ai.service.ts         — Ollama counter-LLM & lures    │
│  • honeypot.service.ts   — Container controls & twin sync│
│  • lure.service.ts       — Steganographic token embedding│
│  • fingerprint.service.ts— Attacker DNA classification   │
│  • bounty.service.ts     — GhostBounty management        │
│  • treasury.service.ts   — STRK20 Shield/Transfer/Unshield│
│  • network.service.ts    — Zero-knowledge threat graph   │
│  • compliance.service.ts — SOC 2 immutable audit ledger  │
├──────────────────────────────────────────────────────────┤
│  Local Data & Privacy Layer                              │
│  • Ollama (llama3.1:8b)  — Air-gapped offline AI inference│
│  • Starknet STRK20       — Shielded UTXO zero-knowledge  │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 22+ or Bun 1.1+
- [Ollama](https://ollama.ai) with `llama3.1:8b` pulled

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/vmmuthu31/deceptiveos.git
cd deceptiveos

# Install dependencies
bun install

# Pull required local AI model (one-time)
ollama pull llama3.1:8b

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
