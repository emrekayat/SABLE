# SABLE Deployment Guide

## 🚀 Testnet Deployment

### Prerequisites

1. **Install Aleo CLI**
   ```bash
   # macOS
   brew install aleo
   
   # Or download from https://github.com/AleoHQ/aleo
   ```

2. **Generate Aleo Account**
   ```bash
   aleo account new
   # Save your private key, view key, and address securely!
   ```

3. **Get Testnet Credits**
   - Visit: https://faucet.aleo.org
   - Request testnet credits for deployment fees

### Deploy Leo Programs

#### 1. Deploy sable_identities.leo

```bash
cd leo-programs/sable_identities

# Build the program
leo build

# Deploy to testnet
leo deploy --network testnet --private-key YOUR_PRIVATE_KEY

# Expected output:
# ✅ Program deployed: sable_identities.aleo
# 📋 Program ID: sable_identities.aleo
```

#### 2. Deploy sable_treasury.leo

```bash
cd ../sable_treasury

leo build
leo deploy --network testnet --private-key YOUR_PRIVATE_KEY

# Expected output:
# ✅ Program deployed: sable_treasury.aleo
```

#### 3. Deploy sable_payroll.leo

```bash
cd ../sable_payroll

leo build
leo deploy --network testnet --private-key YOUR_PRIVATE_KEY

# Expected output:
# ✅ Program deployed: sable_payroll.aleo
```

### Verify Deployment

```bash
# Check program deployment status
aleo program show sable_identities.aleo --network testnet
aleo program show sable_treasury.aleo --network testnet
aleo program show sable_payroll.aleo --network testnet
```

---

## 🔐 Mainnet Deployment (Production)

### Pre-Deployment Checklist

- [ ] Complete security audit by third-party firm
- [ ] Test with synthetic dataset (1000+ employees) on testnet
- [ ] Validate all 3 programs stay under 100KB limit
- [ ] Confirm mapping count < 31 per program
- [ ] Run stress tests for batch processing (30 employees/tx)
- [ ] Prepare incident response plan
- [ ] Setup monitoring and alerting infrastructure

### Mainnet Deployment Steps

#### Phase 1: Audit & Testing (Weeks 1-4)

1. **Security Audit**
   - Engage auditing firm (Trail of Bits, OpenZeppelin, etc.)
   - Review all Leo programs for vulnerabilities
   - Test edge cases and attack vectors
   - Document findings and implement fixes

2. **Testnet Stress Testing**
   ```bash
   # Run batch payroll for 1000 employees (34 batches)
   for i in {1..34}; do
     leo run distribute_private_payroll \
       --network testnet \
       --batch-size 30
   done
   ```

3. **Performance Benchmarking**
   - Measure ZK proof generation time
   - Monitor transaction fees
   - Validate concurrent batch processing

#### Phase 2: Pilot Program (Weeks 5-8)

1. **Select 1-2 Enterprise Partners**
   - Start with companies having 50-100 employees
   - Real-world payroll distribution on testnet
   - Gather feedback on UX and performance

2. **Iterate Based on Feedback**
   - Optimize proof generation speed
   - Improve batch queuing system
   - Enhance error handling

#### Phase 3: Mainnet Migration (Week 9+)

1. **Deploy to Mainnet**
   ```bash
   # Use same deployment steps as testnet but with --network mainnet
   cd leo-programs/sable_identities
   leo deploy --network mainnet --private-key YOUR_MAINNET_PRIVATE_KEY
   
   cd ../sable_treasury
   leo deploy --network mainnet --private-key YOUR_MAINNET_PRIVATE_KEY
   
   cd ../sable_payroll
   leo deploy --network mainnet --private-key YOUR_MAINNET_PRIVATE_KEY
   ```

2. **Gradual Rollout**
   - Week 1: 5 pilot companies
   - Week 2-4: 20 companies
   - Week 5+: Public launch

3. **Monitoring**
   - Track on-chain metrics (company_payroll_total, batch_status)
   - Monitor proof generation success rates
   - Set up alerting for failed transactions

---

## 🏗️ Infrastructure Setup

### Frontend Deployment (Vercel)

```bash
cd apps/dashboard

# Install Vercel CLI
pnpm add -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard:
# - NEXT_PUBLIC_ALEO_NETWORK=mainnet
# - NEXT_PUBLIC_ALEO_API_URL=https://api.explorer.provable.com/v1
```

### Database (Optional - for off-chain metadata)

If storing non-sensitive metadata off-chain:

```bash
# Use Supabase or PostgreSQL
# Store: batch_id, created_at, employee_count, status
# DO NOT STORE: salaries, employee_ids, or any sensitive data
```

---

## 📊 Monitoring & Analytics

### On-Chain Monitoring

```typescript
// Query public mappings for analytics
const companyTotal = await aleoSDK.getCompanyPayrollTotal(companyId);
const batchStatus = await aleoSDK.getBatchStatus(batchId);
```

### Alerting Rules

1. **Transaction Failures**
   - Alert if >5% of transactions fail
   - Investigate immediately if any batch fails

2. **Proof Generation Time**
   - Baseline: <30 seconds per employee
   - Alert if >60 seconds per employee

3. **Gas Fee Spikes**
   - Monitor Aleo network congestion
   - Adjust batch timing if fees spike

---

## 🔄 Upgrade Process

### Smart Contract Upgrades

Aleo programs are immutable once deployed. To upgrade:

1. **Deploy New Version**
   ```bash
   # Deploy sable_payroll_v2.leo
   leo deploy --network mainnet sable_payroll_v2.aleo
   ```

2. **Migrate State**
   - Create migration transition in new program
   - Transfer records from v1 to v2
   - Sunset v1 program

3. **Frontend Updates**
   - Update dashboard to point to new program IDs
   - Maintain backward compatibility during migration

---

## 🛡️ Security Best Practices

### Key Management

1. **Private Keys**
   - Use hardware wallets (Ledger) for mainnet deployments
   - Never commit private keys to Git
   - Rotate keys quarterly

2. **Multi-Sig Treasury**
   - Require 3 of 5 signatures for treasury operations
   - Distribute keys across different geographic locations
   - Use time-locked transactions for large allocations

### Auditor View Keys

1. **Time Limits**
   - Maximum 90-day validity
   - Auto-revoke expired keys on-chain

2. **Scope Restrictions**
   - Tax-only access by default
   - Full access only with board approval

---

## 📝 Post-Deployment Checklist

- [ ] Verify all 3 programs deployed successfully
- [ ] Test end-to-end payroll flow on mainnet
- [ ] Confirm dashboard connects to mainnet programs
- [ ] Setup monitoring dashboards (Grafana + Prometheus)
- [ ] Document program addresses in production README
- [ ] Announce deployment to community
- [ ] Setup support channels (Discord, email)

---

## 🆘 Troubleshooting

### Common Issues

1. **"Program size exceeds 100KB"**
   - Solution: Split into additional modular programs
   - Optimize data structures (use smaller integer types)

2. **"Mapping limit exceeded"**
   - Solution: Use data packing (combine fields into single mapping)
   - Archive old data to separate program

3. **"Batch transaction failed"**
   - Check employee records are valid
   - Verify sufficient treasury balance
   - Ensure batch size ≤ 30 employees

### Getting Help

- **Aleo Discord**: https://discord.com/invite/aleo
- **SABLE Support**: support@sable.aleo
- **Emergency**: Create GitHub issue with [URGENT] prefix

---

**Deployment prepared by SABLE Team | Last updated: January 2026**
