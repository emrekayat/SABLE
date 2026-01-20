// The 'sable_payroll' program distributes private salaries with batch support (30 employees/tx).
// Implements selective disclosure via ZK proofs for tax compliance.

program sable_payroll.aleo {
    
    // ============================================================================
    // RECORDS - Private Salary Data
    // ============================================================================
    
    // Shielded employee salary record (the "winner sauce")
    record ShieldedEmployee {
        owner: address,               // Employee address
        employee_id: field,           // Unique identifier (encrypted)
        salary: u64,                  // Monthly salary (private)
        position: field,              // Position hash (private)
        department_code: u32,         // For Wave 5+ hierarchical keys
        tax_rate: u16,                // Basis points (e.g., 2500 = 25%)
    }
    
    // Salary payment record issued to employee
    record SalaryRecord {
        owner: address,               // Employee address
        amount: u64,                  // Salary amount (private)
        payment_period: field,        // Payment period identifier
        company_id: field,
        issued_at: u64,               // Unix timestamp
    }
    
    // Batch payroll metadata (for 30-employee batches)
    record PayrollBatch {
        owner: address,               // Payroll administrator
        batch_id: field,              // Unique batch identifier
        company_id: field,
        total_amount: u64,            // Total for this batch (private)
        employee_count: u8,           // Number of employees in batch (max 30)
        period: field,                // Payment period
    }
    
    // Tax proof record for selective disclosure
    record TaxProof {
        owner: address,               // Auditor address
        company_id: field,
        total_tax_owed: u64,          // Aggregate tax (ZK-proven, no individual salaries)
        period: field,
        generated_at: u64,
        proof_hash: field,            // Commitment to the ZK proof
    }
    
    // ============================================================================
    // MAPPINGS - Public Compliance Data
    // ============================================================================
    
    // Track total payroll per company (public for compliance)
    mapping company_payroll_total: field => u64;
    
    // Batch processing status
    mapping batch_registry: field => u8; // batch_id => status (0=pending, 1=processing, 2=completed)
    
    // Tax proof registry (public commitments)
    mapping tax_proof_registry: field => field; // period_hash => proof_commitment
    
    // Employee payment counter (public, but not linked to amounts)
    mapping employee_payment_count: field => u32; // employee_id => total_payments_received
    
    // ============================================================================
    // TRANSITIONS - Payroll Distribution
    // ============================================================================
    
    // Create a payroll batch (supports up to 30 employees per Aleo's 32-transition limit)
    transition create_payroll_batch(
        company_id: field,
        batch_id: field,
        total_amount: u64,
        employee_count: u8,
        period: field
    ) -> PayrollBatch {
        // Enforce batch size limit (30 employees + 1 fee transition = 31 total)
        assert(employee_count <= 30u8);
        
        let batch: PayrollBatch = PayrollBatch {
            owner: self.caller,
            batch_id,
            company_id,
            total_amount,
            employee_count,
            period,
        };
        
        return batch then finalize(batch_id, company_id);
    }
    
    async function create_payroll_batch(batch_id: field, company_id: field) {
        batch_registry.set(batch_id, 0u8); // Status: pending
        
        // Initialize company payroll total if not exists
        let current_total: u64 = company_payroll_total.get_or_use(company_id, 0u64);
    }
    
    // Distribute salary to a single employee (called 30 times per batch)
    transition distribute_salary(
        batch: PayrollBatch,
        employee: ShieldedEmployee,
        payment_amount: u64
    ) -> (PayrollBatch, SalaryRecord) {
        // Verify employee is eligible
        assert_eq(batch.company_id, employee.department_code as field); // Simplified check
        assert(batch.total_amount >= payment_amount);
        
        // Create salary record for employee
        let salary_payment: SalaryRecord = SalaryRecord {
            owner: employee.owner,
            amount: payment_amount,
            payment_period: batch.period,
            company_id: batch.company_id,
            issued_at: 1737331200u64, // Placeholder timestamp
        };
        
        // Update batch with remaining amount
        let updated_batch: PayrollBatch = PayrollBatch {
            owner: batch.owner,
            batch_id: batch.batch_id,
            company_id: batch.company_id,
            total_amount: batch.total_amount - payment_amount,
            employee_count: batch.employee_count - 1u8,
            period: batch.period,
        };
        
        return (updated_batch, salary_payment) then finalize(
            batch.company_id,
            employee.employee_id,
            payment_amount
        );
    }
    
    async function distribute_salary(
        company_id: field,
        employee_id: field,
        payment_amount: u64
    ) {
        // Update company payroll total
        let current_total: u64 = company_payroll_total.get_or_use(company_id, 0u64);
        company_payroll_total.set(company_id, current_total + payment_amount);
        
        // Increment employee payment count
        let payment_count: u32 = employee_payment_count.get_or_use(employee_id, 0u32);
        employee_payment_count.set(employee_id, payment_count + 1u32);
    }
    
    // Complete a payroll batch
    transition finalize_batch(batch: PayrollBatch) -> field {
        // Ensure all employees have been paid
        assert_eq(batch.employee_count, 0u8);
        assert_eq(batch.total_amount, 0u64);
        
        return batch.batch_id then finalize(batch.batch_id);
    }
    
    async function finalize_batch(batch_id: field) {
        batch_registry.set(batch_id, 2u8); // Status: completed
    }
    
    // ============================================================================
    // SELECTIVE DISCLOSURE - ZK Tax Proofs (The Winner Sauce Part 2)
    // ============================================================================
    
    // Generate aggregate tax proof without revealing individual salaries
    transition prove_total_tax(
        employees: [ShieldedEmployee; 10], // Batch of employees for proof
        period: field,
        auditor_address: address
    ) -> TaxProof {
        // Calculate total tax across all employees (ZK-proven)
        let total_tax: u64 = 0u64;
        
        // Iterate through employees and sum taxes
        for i: u8 in 0u8..10u8 {
            let employee_tax: u64 = (employees[i].salary * (employees[i].tax_rate as u64)) / 10000u64;
            total_tax += employee_tax;
        }
        
        // Create tax proof record for auditor
        let tax_proof: TaxProof = TaxProof {
            owner: auditor_address,
            company_id: employees[0u8].department_code as field, // Use first employee's company
            total_tax_owed: total_tax,
            period,
            generated_at: 1737331200u64,
            proof_hash: 12345field, // Would be cryptographic commitment in production
        };
        
        return tax_proof then finalize(period, tax_proof.proof_hash);
    }
    
    async function prove_total_tax(period: field, proof_hash: field) {
        // Store proof commitment in public registry
        tax_proof_registry.set(period, proof_hash);
    }
    
    // Verify tax proof (called by auditor with view key)
    transition verify_tax_proof(
        proof: TaxProof,
        expected_amount: u64
    ) -> bool {
        // Simple verification - in production would verify ZK proof
        let is_valid: bool = proof.total_tax_owed == expected_amount;
        return is_valid;
    }
    
    // ============================================================================
    // HELPER TRANSITIONS - Batch Processing Support
    // ============================================================================
    
    // Register shielded employee for payroll
    transition register_for_payroll(
        employee_id: field,
        salary: u64,
        position: field,
        department_code: u32,
        tax_rate: u16
    ) -> ShieldedEmployee {
        let employee: ShieldedEmployee = ShieldedEmployee {
            owner: self.caller,
            employee_id,
            salary,
            position,
            department_code,
            tax_rate,
        };
        
        return employee;
    }
    
    // Update employee salary (for annual reviews, promotions)
    transition update_salary(
        employee: ShieldedEmployee,
        new_salary: u64,
        new_tax_rate: u16
    ) -> ShieldedEmployee {
        let updated_employee: ShieldedEmployee = ShieldedEmployee {
            owner: employee.owner,
            employee_id: employee.employee_id,
            salary: new_salary,
            position: employee.position,
            department_code: employee.department_code,
            tax_rate: new_tax_rate,
        };
        
        return updated_employee;
    }
}
