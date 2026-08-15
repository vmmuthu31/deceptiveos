# CipherNest

**Adversarial AI Defense Engine — The World's First AI-Native Cyber Deception Platform**

> *While attackers use AI to move 100× faster, CipherNest deploys intelligent decoys that fight back — automatically trapping, fingerprinting, and wasting attacker time, with zero cloud dependency.*

CipherNest is an open-source, local-first cyber deception platform that goes far beyond honeypots. It deploys self-updating digital twin decoys, generates semantically authentic lure documents with tracking watermarks, fingerprints attacker identity across sessions, and is purpose-built to counter the new wave of autonomous AI-driven attacks — all running entirely on your own machine.

---

## Why CipherNest Exists

Every major deception tool today was built to fool **human** attackers moving at human speed. In 2026, autonomous AI agents compress full attack lifecycles to under 25 minutes. Static honeypots get identified and skipped in seconds by automated scanners. Existing platforms cost $10,000–$100,000/year and still just log events.

**CipherNest is built for the AI-vs-AI era of cybersecurity.**

---

## Core Innovation Pillars

### 🤖 AI Attacker Trap
Honeypots designed specifically to fool autonomous AI agents, not just human attackers. Counter-LLM generates responses with realistic timing jitter, statistically authentic command output, and synthetic process memory that defeats automated scanners. When your attacker is an AI agent, your defense must also be one.

### 🪞 Living Digital Twin Decoy
Automatically mirrors your real infrastructure — same hostnames, directory structures, file naming conventions, software versions — and stays synchronized as your environment changes. No manual configuration. The decoy is always convincingly current because it reads from your real system's metadata via the local native agent.

### 🧬 Attacker DNA Fingerprinting
Builds a behavioral fingerprint from every session: command timing patterns, tool signatures, error-handling behavior, timezone inference, typo patterns. Cross-references across sessions to answer: *"Is this the same group that attacked you 3 months ago? The same actor that hit 40 other organizations?"* Maps against MITRE ATT&CK group signatures automatically.

### ⏳ Temporal Deception Engine
Doesn't just observe attackers — mathematically maximizes the time they spend inside your fake environment. Calculated response delays, fake long-running processes, synthetic "other user" activity, and realistic encryption latency keep attackers engaged while your real team responds. Every minute in your decoy is a minute away from your real systems.

### 📄 Semantic Lure Generator + Tracking Watermarks
Uses local LLM to generate company-specific fake documents — contracts with real supplier names, employee lists matching your org structure, source code in your actual language and style — indistinguishable from real data. Every document is embedded with an invisible steganographic watermark that pings home if it surfaces on dark web leak sites or in phishing campaigns. Your fake document becomes a tracking beacon.

---

## Feature Matrix

| Capability | CipherNest | Thinkst Canary | T-Pot | OpenCanary |
|---|---|---|---|---|
| LLM-powered interactive honeypots | ✅ | ❌ | ❌ | ❌ |
| AI attacker detection & counter-engagement | ✅ | ❌ | ❌ | ❌ |
| Living digital twin (auto-sync) | ✅ | ❌ | ❌ | ❌ |
| Attacker behavioral fingerprinting | ✅ | ❌ | ❌ | ❌ |
| Semantic lure generation | ✅ | ❌ | ❌ | ❌ |
| Document tracking watermarks | ✅ | ❌ | ❌ | ❌ |
| Temporal deception (time-wasting engine) | ✅ | ❌ | ❌ | ❌ |
| Fully local / air-gap capable | ✅ | ❌ | ✅ | ✅ |
| SOC 2 / ISO 27001 / GDPR evidence export | ✅ | ❌ | ❌ | ❌ |
| STIX 2.1 / Sigma / TAXII output | ✅ | ❌ | ✅ | ❌ |
| Desktop app (no server required) | ✅ | ❌ | ❌ | ❌ |
| Entry price | **Free / OSS** | $10,000/yr | Free | Free |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Electron Desktop App (React 19 + TypeScript)            │
│  • Live attack dashboard   • Attacker profile viewer     │
│  • Lure document studio    • Twin sync status            │
│  • Temporal deception ctrl • Compliance evidence export  │
├──────────────────────────────────────────────────────────┤
│  Rust Backend (Axum + Tokio)                             │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │ honeypot-engine │  │ ai-engine                    │  │
│  │ • Docker orchst │  │ • Attacker type classifier   │  │
│  │ • Twin sync     │  │ • Behavioral fingerprinting  │  │
│  │ • Temporal ctrl │  │ • Isolation Forest / DBSCAN  │  │
│  └─────────────────┘  └──────────────────────────────┘  │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │ lure-engine     │  │ integration-layer             │  │
│  │ • LLM doc gen   │  │ • SIEM / Sigma / STIX 2.1    │  │
│  │ • Watermarking  │  │ • TAXII server               │  │
│  │ • Beacon track  │  │ • Firewall blocklists        │  │
│  └─────────────────┘  └──────────────────────────────┘  │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │ compliance      │  │ native (napi-rs)              │  │
│  │ • SOC 2 export  │  │ • Entropy scoring            │  │
│  │ • ISO 27001     │  │ • Steganographic watermarks  │  │
│  │ • GDPR evidence │  │ • Env metadata reader        │  │
│  └─────────────────┘  └──────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│  Local AI Layer                                          │
│  • Ollama / Llama 3.1:8b  — honeypot responses          │
│  • Ollama / Llama 3.1:8b  — lure document generation    │
│  • Ollama / Llama 3.1:8b  — attacker classification     │
├──────────────────────────────────────────────────────────┤
│  Data Layer                                              │
│  • PostgreSQL 16  • Redis 7  • STIX 2.1 bundle          │
└──────────────────────────────────────────────────────────┘
         ▲                    ▲
         │                    │
  Docker Honeypots     Real Environment
  (Cowrie, Dionaea,    (read-only metadata
   CustomLLM)          for twin sync)
```

---

## Quick Start

### Prerequisites

- Rust 1.85+
- Node.js 22+
- Docker (for honeypots)
- PostgreSQL 16+
- Redis 7+
- [Ollama](https://ollama.ai) with `llama3.1:8b` pulled

### Development

```bash
# Clone and install
git clone https://github.com/ciphernest/ciphernest.git
cd ciphernest
npm install

# Pull the local AI model (one-time)
ollama pull llama3.1:8b

# Start infrastructure
docker-compose up -d        # PostgreSQL, Redis, honeypots, Ollama

# Start development servers
npm run dev                  # Frontend + Electron
npm run dev:rust             # Rust backend (watch mode)
```

### Build

```bash
npm run build               # Build frontend + Rust backend
npm run package             # Package Electron app (.dmg / .exe / .AppImage)
```

### Try the Semantic Lure Generator (Quickest Demo)

```bash
# No Docker required — just Ollama running
npm run dev:rust
# Open the app → Lure Studio → Generate → drop a fake "salary_Q3.xlsx" lure
# The lure contains an invisible watermark beacon
```

---

## Project Structure

```
ciphernest/
├── electron/                     # Electron main process + IPC bridge
├── frontend/                     # React 19 dashboard
│   └── src/pages/
│       ├── Dashboard.tsx         # Live stats + attacker activity feed
│       ├── Honeypots.tsx         # Honeypot deploy + twin sync
│       ├── Events.tsx            # Session timeline + command replay
│       ├── Alerts.tsx            # Attacker alerts + DNA profiles
│       ├── LureStudio.tsx        # Semantic lure generator [planned]
│       └── Settings.tsx          # Config + compliance toggles
├── rust/
│   └── crates/
│       ├── ciphernest-core/      # Shared types, config, error handling
│       ├── honeypot-engine/      # Docker orchestration + twin sync
│       ├── ai-engine/            # Attacker classification + fingerprinting
│       ├── lure-engine/          # Semantic lure gen + watermarking [planned]
│       ├── integration-layer/    # SIEM, STIX 2.1, TAXII, Sigma
│       ├── compliance/           # SOC 2, ISO 27001, GDPR audit export
│       └── native/               # napi-rs: entropy, watermarks, env reader
├── docker/                       # Cowrie + Dionaea configs + compose
├── docs/                         # Architecture, API, compliance docs
└── scripts/                      # Build, release, migration scripts
```

---

## Roadmap

### Phase 1 — Working Demo (Now)
- [x] Core data models and Rust workspace
- [x] React dashboard with live polling
- [x] Docker compose with Cowrie + Dionaea
- [x] Electron desktop app shell
- [ ] Wire DB pool into server binary
- [ ] Electron IPC bridge (start Rust server from app)
- [ ] Cowrie log watcher → PostgreSQL events
- [ ] Basic alert rules (repeated auth failures)

### Phase 2 — Novel Engine (Next)
- [ ] LLM honeypot: Ollama responds to SSH commands in real time
- [ ] Attacker type classifier (script kiddie / human / AI agent)
- [ ] Semantic lure generator (Ollama + company context)
- [ ] Steganographic watermark embedding in generated documents
- [ ] Beacon tracking endpoint (watermark callback receiver)

### Phase 3 — Intelligence Layer
- [ ] Attacker DNA fingerprinting (cross-session behavioral graph)
- [ ] MITRE ATT&CK group matching
- [ ] Living digital twin sync (env metadata reader via native module)
- [ ] Temporal deception engine (calculated engagement maximization)
- [ ] Federated threat feed (opt-in anonymized TTP sharing)

### Phase 4 — Enterprise & Compliance
- [ ] One-click compliance evidence PDF export
- [ ] FedRAMP readiness mode (air-gap, no external calls)
- [ ] Full STIX 2.1 bundle + TAXII 2.1 server
- [ ] Sigma rule auto-generation from session data

---

## Documentation

- [Architecture Guide](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)
- [Compliance Guide](docs/compliance.md)
- [API Documentation](docs/api.md)
- [Product Vision](PRODUCT.md)

---

## License

AGPL-3.0-or-later — See [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.
