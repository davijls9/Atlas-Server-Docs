# Atlas Server Docs

> A comprehensive, enterprise-grade infrastructure documentation and security intelligence platform built for DevOps and SecOps teams.

---

## 🧭 Overview

**Atlas Server Docs** is a full-stack front-end application that enables teams to architect, document, and audit their server infrastructure visually. It combines a visual node-based infrastructure mapper, a security compliance engine, a documentation system, and a governance policy matrix — all in one intelligent platform.

Built with React 19, TypeScript, and Vite, the platform runs entirely client-side and is designed for maximum performance and offline capability.

---

## ✨ Features

### 🗺️ Infrastructure Map
- Visual, interactive node-based infrastructure editor powered by **ReactFlow**
- Drag, connect, and configure server nodes (POPs, VMs, Switches, DNS, etc.)
- Smart edge handling with manual reconnection and delete support
- Real-time topology visualization with live sync to the Blueprint engine

### 📋 Blueprint Studio
- Spreadsheet-style data matrix with multi-cell selection, copy/paste, and arrow-key navigation
- Custom schema definitions with configurable field types (Text, Number, Boolean, Dropdown)
- Auto-save and state persistence via `localStorage`
- JSON import/export for blueprint collaboration

### 🔐 Security Intelligence Portal
- **Compliance Matrix** — Attribute-level compliance tracking across all infrastructure nodes
- **Tactical Intel Dashboard** — Real-time audit stream, forensic deep-dive mode, and incident inspection
- **SSDLC Dashboard** — Secure Software Development Life Cycle compliance monitoring
- **Governance Policy Matrix** — Granular permission system with group-based protocol access control
- **Interactive System Scanning** — On-demand architecture re-scans with animated progress overlays

### 📚 Documentation System
- Rich in-app documentation editor with page management
- **Quick-View Modal** — Context-sensitive docs accessible from anywhere in the application
- Cross-linking: docs can be correlated to specific blueprint nodes or infrastructure pages
- Mermaid diagram rendering for architecture visualizations

### 🔑 Security Middleware
- Session-based authorization with ADMIN role bypass and group-level protocol enforcement
- TTL-based permission caching for zero-latency navigation
- Audit trail logging for all unauthorized access attempts
- Support for both `atlas_` and legacy `antigravity_` storage namespaces

### 🧪 Atlas Test Runner (Internal Audit System)
- Custom, lightweight testing engine with ANSI-colored terminal output
- **300+ tests** across 6 testing modalities
- Executes automatically on every server startup in development mode
- Results are streamed to the Node terminal via a custom Vite middleware

---

## 🏗️ Architecture

```
src/
├── components/          # Global UI components
│   ├── SecurityIntel.tsx
│   ├── BlueprintEditor.tsx
│   ├── InfraMap.tsx
│   └── ...
├── modules/             # Feature modules
│   ├── security/        # Security, SSDLC, Governance
│   ├── blueprint/       # Blueprint engine, hooks, types
│   ├── documentation/   # DocEditor, DocViewer, QuickModal
│   └── common/          # Shared components
├── hooks/               # Global shared hooks
│   └── useSecurityScan.ts
├── utils/
│   └── securityMiddleware.ts
└── tests/               # Internal testing suite
    ├── AtlasTestRunner.ts
    ├── TestGenerators.ts
    ├── WhiteBox.test.ts
    ├── BlackBox.test.ts
    ├── GreyBox.test.ts
    ├── Performance.test.ts
    ├── Stress.test.ts
    └── Chaos.test.ts
```

---

## 🧪 Testing Suite

The platform ships with a built-in testing infrastructure that runs on every `npm run dev` startup.

| Suite | Type | Tests | Focus |
|---|---|---|---|
| `WhiteBox.test.ts` | White Box | 100+ | Internal logic paths, permission bypass logic |
| `BlackBox.test.ts` | Black Box | 110+ | Public interfaces, storage policy enforcement |
| `GreyBox.test.ts` | Grey Box | 102+ | Session/group integration, state flows |
| `Performance.test.ts` | Performance | ~5 | Latency benchmarks (<1ms per check) |
| `Stress.test.ts` | Stress | ~5 | 1000+ rapid permission transitions |
| `Chaos.test.ts` | Chaos/Fuzzing | ~10 | Malformed data injection, resilience |

**Total: 300+ automated tests** — Terminal output includes batch reporting and per-test timing for performance suites.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **npm** v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/davijls9/atlas-server-docs.git
cd atlas-server-docs

# Install dependencies
npm install
```

### Running in Development

```bash
npm run dev
```

The Vite dev server will start on `http://localhost:5173`. The internal Atlas Test Runner will execute automatically, printing a full audit report to the terminal.

### Building for Production

```bash
npm run build
```

Output will be generated in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | ~5.9 | Type safety |
| Vite | 7 | Build tool & dev server |
| ReactFlow | 11 | Infrastructure map visualization |
| Tailwind CSS | 4 | Styling |
| Blockly | 12 | Visual scripting blocks |
| Mermaid | 11 | Architecture diagram rendering |
| Lucide React | 0.563 | Icon system |
| file-saver | 2 | PDF/JSON export |

---

## 🔐 Permissions & Governance

The platform uses a role-based access control system managed through the **Governance Policy Matrix**. Protocol access can be assigned at the group level with granular per-action permissions.

Key built-in protocols include:
- `view_editor` — Blueprint Studio access
- `view_map` — Infrastructure Map access
- `view_security` — Security Portal access
- `view_security_intel` — Tactical Intel & Forensics access
- `view_docs` — Documentation access
- `manage_users` — User and group management

ADMIN role and `admin-group` members bypass all protocol restrictions.

---

## 📁 Data Persistence

All data is persisted client-side via `localStorage` with Atlas-namespaced keys:

- `atlas_session` — Current user session
- `atlas_groups` — Group and permission definitions
- `atlas_blueprints` — Blueprint node data
- `atlas_docs` — Documentation pages
- `atlas_logs` — System audit logs

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

<p align="center">Built with ❤️ by the Atlas team</p>
