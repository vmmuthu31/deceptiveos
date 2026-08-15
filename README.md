# CipherNest

**Adversarial AI Defense Engine — The World's First AI-Native Cyber Deception Platform**

> *While attackers use AI to move 100× faster, CipherNest deploys intelligent decoys that fight back — automatically trapping, fingerprinting, and wasting attacker time, with zero cloud dependency.*

CipherNest is an open-source, local-first cyber deception platform built with Next.js (App Router), TypeScript, Tailwind CSS v4, and local Ollama AI. It deploys self-updating digital twin decoys, generates semantically authentic lure documents with tracking watermarks, fingerprints attacker identity across sessions, and is purpose-built to counter autonomous AI-driven attacks — all running entirely on your own machine.

---

## Core Innovation Pillars

- **🤖 AI Attacker Trap**: Honeypots designed specifically to fool autonomous AI agents. Local Ollama counter-LLM generates responses with realistic timing jitter (50–800ms) and statistically authentic command outputs.
- **🪞 Living Digital Twin Decoy**: Automatically mirrors real infrastructure metadata (hostnames, directory structures, software versions) using read-only filesystem scanning.
- **🧬 Attacker DNA Fingerprinting**: Builds a behavioral fingerprint from command timing patterns, tool signatures, typo patterns, and timezone estimates mapped against MITRE ATT&CK signatures.
- **📄 Semantic Lure Generator + Tracking Watermarks**: Uses local LLM to generate company-specific fake documents embedded with invisible steganographic watermarks that ping home if exfiltrated.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  CipherNest Next.js App Router (TypeScript + Tailwind)   │
│  • Dashboard  • Honeypots  • Events  • Alerts  • Lures   │
├──────────────────────────────────────────────────────────┤
│  Server API & Services (src/server/services/)            │
│  • ai.service.ts         — Ollama counter-LLM & lures    │
│  • honeypot.service.ts   — Container controls & twin sync│
│  • lure.service.ts       — Watermark token & beacon rx   │
│  • fingerprint.service.ts— Attacker DNA classification   │
│  • compliance.service.ts — SOC 2 evidence export         │
├──────────────────────────────────────────────────────────┤
│  Local AI & Data Layer                                   │
│  • Ollama (llama3.1:8b)  — Local offline AI inference    │
└──────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Node.js 22+ or Bun 1.1+
- [Ollama](https://ollama.ai) with `llama3.1:8b` pulled

### Development

```bash
# Install dependencies
bun install

# Start local AI model (one-time)
ollama pull llama3.1:8b

# Start Next.js development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the CipherNest dashboard.
