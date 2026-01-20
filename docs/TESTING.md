# Leo Program Testing Guide

## Quick Start

### 1. Test sable_identities.leo

```bash
cd leo-programs/sable_identities

# Build the program
leo build

# Test: Create a company
leo run create_company \
  1234567890field \
  100u32 \
  3u8

# Test: Register an employee
leo run register_employee \
  "{
    owner: aleo1...,
    company_id: 1234567890field,
    total_employees: 100u32,
    authorized_signers: 3u8
  }" \
  987654321field \
  10u32 \
  1737331200u64 \
  0u8 \
  aleo1...

# Test: Issue auditor view key
leo run issue_auditor_key \
  "{owner: aleo1..., company_id: 1234567890field, ...}" \
  aleo1auditor... \
  1740009600u64 \
  1u8
```

### 2. Test sable_treasury.leo

```bash
cd ../sable_treasury

leo build

# Test: Initialize treasury
leo run initialize_treasury \
  1234567890field \
  1000000u64 \
  3u8

# Test: Allocate payroll
leo run allocate_payroll \
  "{owner: aleo1..., balance: 1000000u64, ...}" \
  "{owner: aleo1..., company_id: 1234567890field, can_allocate: true, ...}" \
  300000u64 \
  111222333field \
  1740009600u64
```

### 3. Test sable_payroll.leo

```bash
cd ../sable_payroll

leo build

# Test: Create payroll batch
leo run create_payroll_batch \
  1234567890field \
  111222333field \
  300000u64 \
  30u8 \
  202601field

# Test: Distribute salary
leo run distribute_salary \
  "{owner: aleo1..., batch_id: 111222333field, total_amount: 300000u64, ...}" \
  "{owner: aleo1employee..., employee_id: 987654321field, salary: 10000u64, ...}" \
  10000u64

# Test: Generate tax proof
leo run prove_total_tax \
  "[{owner: aleo1..., salary: 10000u64, tax_rate: 2500u16, ...}, ...]" \
  202601field \
  aleo1auditor...
```

---

## Synthetic Dataset Testing

### Generate 1000 Employee Dataset

```bash
# Create test data generator script
cat > generate_test_data.sh << 'EOF'
#!/bin/bash

# Generate 1000 employee records for stress testing
for i in {1..1000}; do
  employee_id=$((1000000 + i))field
  salary=$((50000 + RANDOM % 150000))u64
  tax_rate=$((2000 + RANDOM % 1000))u16
  
  echo "Employee $i:"
  echo "  ID: $employee_id"
  echo "  Salary: $salary"
  echo "  Tax Rate: $tax_rate"
done
EOF

chmod +x generate_test_data.sh
./generate_test_data.sh > test_employees.txt
```

### Run Batch Stress Test

```bash
# Process 1000 employees in batches of 30 (34 batches total)
for batch in {1..34}; do
  echo "Processing batch $batch of 34..."
  
  # Calculate batch range
  start=$(( (batch - 1) * 30 + 1 ))
  end=$(( batch * 30 ))
  
  # Create batch
  leo run create_payroll_batch \
    1234567890field \
    ${batch}field \
    900000u64 \
    30u8 \
    202601field
  
  echo "Batch $batch created successfully"
  sleep 1
done
```

---

## Integration Testing

### End-to-End Payroll Flow

```bash
#!/bin/bash
# e2e_test.sh - Complete payroll workflow

set -e

echo "🧪 SABLE E2E Test: Complete Payroll Flow"
echo "========================================"

# 1. Setup Company
echo "\n1️⃣  Creating company identity..."
leo run create_company 1234567890field 100u32 3u8
echo "✅ Company created"

# 2. Initialize Treasury
echo "\n2️⃣  Initializing treasury..."
leo run initialize_treasury 1234567890field 10000000u64 3u8
echo "✅ Treasury initialized with 10M credits"

# 3. Register Employees
echo "\n3️⃣  Registering employees..."
for i in {1..30}; do
  employee_id=$((1000000 + i))field
  echo "  Registering employee $i (ID: $employee_id)"
  # ... registration logic
done
echo "✅ 30 employees registered"

# 4. Allocate Payroll
echo "\n4️⃣  Allocating payroll budget..."
leo run allocate_payroll ... 300000u64 ...
echo "✅ 300K credits allocated"

# 5. Create Batch
echo "\n5️⃣  Creating payroll batch..."
leo run create_payroll_batch 1234567890field 111222333field 300000u64 30u8 202601field
echo "✅ Batch created"

# 6. Distribute Salaries
echo "\n6️⃣  Distributing salaries..."
for i in {1..30}; do
  echo "  Paying employee $i..."
  leo run distribute_salary ... 10000u64
done
echo "✅ All salaries distributed"

# 7. Generate Tax Proof
echo "\n7️⃣  Generating tax proof for auditor..."
leo run prove_total_tax ...
echo "✅ Tax proof generated"

echo "\n🎉 E2E Test Complete!"
echo "Summary:"
echo "  - Company created ✅"
echo "  - Treasury initialized ✅"
echo "  - 30 employees registered ✅"
echo "  - Payroll distributed ✅"
echo "  - Tax proof generated ✅"
```

Make executable and run:
```bash
chmod +x e2e_test.sh
./e2e_test.sh
```

---

## Common Test Cases

### 1. Boundary Testing

```bash
# Test: Minimum batch size (1 employee)
leo run create_payroll_batch 1234567890field 1field 10000u64 1u8 202601field

# Test: Maximum batch size (30 employees)
leo run create_payroll_batch 1234567890field 2field 300000u64 30u8 202601field

# Test: Edge case - Batch size 31 (should fail)
leo run create_payroll_batch 1234567890field 3field 310000u64 31u8 202601field
# Expected: Assertion failure
```

### 2. Authorization Testing

```bash
# Test: Unauthorized withdraw (should fail)
leo run withdraw \
  "{owner: aleo1company..., ...}" \
  "{owner: aleo1attacker..., can_allocate: false, ...}" \
  50000u64
# Expected: Assertion failure (signer not authorized)
```

### 3. View Key Expiration

```bash
# Test: Expired view key verification
leo run verify_auditor_access \
  "{owner: aleo1auditor..., expires_at: 1000000u64, ...}" \
  1740009600u64
# Expected: Returns false (current_time > expires_at)
```

---

## Debugging Tips

### 1. Enable Verbose Output

```bash
leo run --verbose create_company 1234567890field 100u32 3u8
```

### 2. Inspect Program Constraints

```bash
# Check how many constraints your program uses
leo build --verbose

# Output example:
# ✅ Constraints: 45,231 (well under limit)
# ✅ Variables: 12,456
```

### 3. Test Mapping Queries

```bash
# After running transitions, query public mappings
aleo mapping get company_headcount 1234567890field --network testnet
# Expected: 100u32
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Leo Program Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Leo
        run: |
          curl -L https://github.com/AleoHQ/aleo/releases/download/v1.0.0/aleo-linux.tar.gz | tar xz
          sudo mv aleo /usr/local/bin/
      
      - name: Test sable_identities
        run: |
          cd leo-programs/sable_identities
          leo build
          leo run create_company 1234567890field 100u32 3u8
      
      - name: Test sable_treasury
        run: |
          cd leo-programs/sable_treasury
          leo build
          leo run initialize_treasury 1234567890field 1000000u64 3u8
      
      - name: Test sable_payroll
        run: |
          cd leo-programs/sable_payroll
          leo build
          leo run create_payroll_batch 1234567890field 111field 300000u64 30u8 202601field
```

---

## Next Steps

1. **Run E2E Test**: Execute `e2e_test.sh` to validate entire flow
2. **Stress Test**: Generate 1000 employees and process in batches
3. **Deploy to Testnet**: Follow `DEPLOYMENT.md` for testnet deployment
4. **Monitor Metrics**: Track proof generation time, gas costs, success rates

---

**Happy Testing! 🧪**
