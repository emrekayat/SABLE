# SABLE Architecture

## Overview
SABLE is a privacy-preserving payroll and treasury management system for enterprises, built on the Aleo blockchain. It combines modular Leo smart contracts, a modern Next.js dashboard, and a TypeScript SDK for seamless ZK-powered operations.

---

## 1. Leo Programs

### sable_identities.aleo
- Manages shielded employee identity records and company registration.
- Each employee has a private identity record.
- Auditor view keys allow time-limited, read-only access for compliance.

### sable_treasury.aleo
- Handles corporate treasury with multi-signature authorization.
- Tracks allocations, batch operations, and audit logs.
- All balances and operations are encrypted by default.

### sable_payroll_zk.aleo
- Core payroll distribution logic with real ZK-proofs.
- Creates SalaryPayment and EmployeeCredential records for each employee.
- Batch size: 30 employees per transaction (Aleo's 32-transition limit).

---

## 2. Dashboard (Next.js)
- Located in `apps/dashboard/`, built with Next.js 14.
- Uses real employee data (`src/data/employees.json`) and live treasury balance.
- Wallet integration, ZK transaction flow, and batch management via React + Framer Motion.
- Professional UI components and Proof Generator Modal for user feedback.

---

## 3. SDK & Data Flow
- TypeScript SDK in `packages/aleo-sdk-wrapper/`.
- Provides functions like `initializeTreasury`, `createEmployeeCredential`, `distributeSalary` for Leo contract interaction.
- All ZK transactions are initiated client-side via the user's Aleo wallet.

---

## 4. Security
- Private keys are never sent to any server; all ZK-proofs are generated in the browser.
- Auditor view keys are time-limited and read-only.
- All records are encrypted using Aleo's native privacy features.

---

## 5. Deployment
- Monorepo structure: `apps/`, `packages/`, `leo-programs/`.
- Next.js dashboard is deployed on Vercel; Leo programs are deployed on Aleo testnet/mainnet.
- Shared dependencies managed via pnpm and Turborepo.

---

## 6. Roadmap (Short)
- [x] ZK payroll distribution (testnet)
- [x] Real employee data and batch processing
- [ ] Multi-sig treasury (coming soon)
- [ ] Department-level view keys (future)
- [ ] Mainnet launch and enterprise pilots

---

For more details, see the codebase and README.md.
