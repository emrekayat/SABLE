# SABLE — The Invisible Engine of Global Trade

**Private Payroll & Invoice Management on Aleo Blockchain**

> 100% Financial Privacy. 100% Audit Compliance.

## 🎯 Project Overview

SABLE is a mainnet-ready B2B infrastructure that provides zero-knowledge payroll processing for corporations. Built on Aleo, it encrypts employee salaries, positions, and identities while maintaining full regulatory compliance through selective disclosure mechanisms.

## 🏗️ Architecture

### Modular Leo Programs (< 100KB each)

- **`sable_identities.leo`** - Employee identity management with encrypted records
- **`sable_treasury.leo`** - Corporate treasury with multi-sig authorization
- **`sable_payroll.leo`** - Private salary distribution with batch processing (30 employees/tx)

### Monorepo Structure

```
SABLE/
├── apps/
│   └── dashboard/          # Next.js 14 Executive Dashboard
├── packages/
│   ├── ui/                 # Shared UI components (Framer Motion)
│   ├── aleo-sdk-wrapper/   # Provable SDK integration
│   ├── tsconfig/           # Shared TypeScript configs
│   └── eslint-config/      # Shared ESLint configs
└── leo-programs/
    ├── sable_identities/   # Identity records
    ├── sable_treasury/     # Treasury management
    └── sable_payroll/      # Payroll distribution
```

## 🔑 Key Features

### 1. Batch Payroll Distribution
- **Batch Size:** 30 employees per transaction (Aleo's 32-transition limit)
- **Client-Side Queuing:** Automatic partitioning with progress tracking
- **ZK-Proof Generation:** Real-time UI feedback for each batch

### 2. Selective Transparency (View Keys)
- **Wave 1-2:** Per-auditor view keys with time-limited access (Option A)
- **Wave 5+ (Planned):** Hierarchical Deterministic derivation for department-level visibility (Option B)
- **ZKP Tax Proofs:** `prove_total_tax` transition generates compliance proofs without revealing individual salaries

### 3. Enterprise-Grade UI
- **Design System:** Deep grays, white, subtle shadows (no crypto clutter)
- **Proof Generator Modal:** Visual ZK-circuit solving steps
- **Tech Stack:** Next.js 14, pnpm, Turborepo, Framer Motion

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Aleo CLI (for Leo program development)

### Installation

```bash
# Install dependencies
pnpm install

# Start development dashboard
pnpm dev

# Build all packages
pnpm build

# Lint all code
pnpm lint
```

### Leo Program Development

```bash
cd leo-programs/sable_payroll

# Compile Leo program
leo build

# Run tests
leo run distribute_private_payroll

# Deploy to testnet
leo deploy --network testnet
```

## 📊 Aleo Protocol Limits

| Constraint | Limit | SABLE Strategy |
|------------|-------|----------------|
| Max Program Size | 100 KB | Modular programs (3 separate .leo files) |
| Max Mappings per Program | 31 | Data packing techniques |
| Max Transitions per Transaction | 32 | Batch size of 30 employees |
| Max Transaction Size | 128 KB | Optimized data types |

## 🛣️ Roadmap

- **Wave 1-2:** Core payroll distribution with per-auditor view keys
- **Wave 3-4:** Invoice management and multi-currency support
- **Wave 5+:** Hierarchical view keys for department-level granularity
- **Mainnet:** Security audit → Testnet validation → Mainnet deployment

## 🧪 Deployment Strategy

### Phase 1: Testnet (Current)
```bash
# Deploy identity management
cd leo-programs/sable_identities
leo deploy --network testnet

# Deploy treasury
cd ../sable_treasury
leo deploy --network testnet

# Deploy payroll
cd ../sable_payroll
leo deploy --network testnet
```

### Phase 2: Mainnet
1. **Security Audit:** Third-party smart contract audit
2. **Synthetic Testing:** 1000+ employee dataset on testnet
3. **Gradual Migration:** Pilot with 1-2 enterprises
4. **Full Launch:** Public mainnet deployment

## 🔐 Security Considerations

- **Private Keys:** Never exposed; all ZK proofs generated client-side
- **View Keys:** Time-limited with cryptographic expiration
- **Record Encryption:** Aleo's native encryption for all salary data
- **Audit Trail:** Public mappings for compliance without revealing private data

## 📝 License

MIT License - See LICENSE file for details

---

**Built for the Invisible Economy. Powered by Aleo.**
