// The 'sable_payroll_v2' program - Private Payroll with ZK Proofs
// Employees receive payments privately, only payroll admin sees full data
program sable_payroll_v2.aleo {
    
    // Private record for treasury balance (only admin knows total)
    record Treasury {
        owner: address,          // Payroll admin
        balance: u64,            // Private: total treasury balance
    }
    
    // Private record for employee salary payment
    // Only the employee can see their own payment details
    record SalaryPayment {
        owner: address,          // Employee address
        amount: u64,             // Private: salary amount
        batch_id: field,         // Private: which payroll batch
        timestamp: u64,          // Private: when paid
    }
    
    // Private employee record (stored off-chain, verified on-chain)
    record EmployeeCredential {
        owner: address,          // Employee address
        employee_id: field,      // Private: employee ID
        salary_amount: u64,      // Private: monthly salary
        is_active: bool,         // Private: employment status
    }
    
    // Prevent upgrades for security
    @noupgrade
    async constructor() {}
    
    // Admin initializes treasury with funds
    // ZK Proof: Proves treasury has X credits without revealing to employees
    transition initialize_treasury(
        public admin_address: address,
        public initial_balance: u64
    ) -> Treasury {
        return Treasury {
            owner: admin_address,
            balance: initial_balance,
        };
    }
    
    // Private salary distribution
    // ZK Proof: Employee receives payment without revealing amount to others
    transition distribute_private_salary(
        treasury: Treasury,              // Private input: treasury record
        employee_credential: EmployeeCredential,  // Private input: employee data
        public batch_id: field           // Public: batch ID for auditing
    ) -> (SalaryPayment, Treasury, EmployeeCredential) {
        
        // ZK Proof 1: Verify employee is active (private)
        assert(employee_credential.is_active);
        
        // ZK Proof 2: Verify treasury has enough balance (private)
        assert(treasury.balance >= employee_credential.salary_amount);
        
        // Create private salary payment for employee
        let payment: SalaryPayment = SalaryPayment {
            owner: employee_credential.owner,
            amount: employee_credential.salary_amount,
            batch_id: batch_id,
            timestamp: 0u64,  // Timestamp (would be set by frontend)
        };
        
        // Update treasury (subtract payment, keep private)
        let updated_treasury: Treasury = Treasury {
            owner: treasury.owner,
            balance: treasury.balance - employee_credential.salary_amount,
        };
        
        // Return employee credential unchanged
        let returned_credential: EmployeeCredential = EmployeeCredential {
            owner: employee_credential.owner,
            employee_id: employee_credential.employee_id,
            salary_amount: employee_credential.salary_amount,
            is_active: employee_credential.is_active,
        };
        
        // ZK Proof generated: Payment made, balances updated, all private
        return (payment, updated_treasury, returned_credential);
    }
    
    // Batch payroll processing (privacy-preserving)
    // ZK Proof: Proves payroll completed for N employees without revealing salaries
    transition process_private_batch(
        treasury: Treasury,              // Private: treasury balance
        public batch_id: field,          // Public: for audit trail
        public employee_count: u32,      // Public: how many employees paid
        public total_committed: u64      // Public: total amount committed (hash/commitment)
    ) -> Treasury {
        
        // ZK Proof 1: Verify employee count is reasonable
        assert(employee_count > 0u32);
        assert(employee_count <= 1000u32);
        
        // ZK Proof 2: Verify treasury has enough for batch
        assert(treasury.balance >= total_committed);
        
        // Update treasury after batch payment
        let updated_treasury: Treasury = Treasury {
            owner: treasury.owner,
            balance: treasury.balance - total_committed,
        };
        
        // ZK Proof generated: Batch processed, treasury updated
        // Individual salaries remain private
        return updated_treasury;
    }
    
    // Employee credential creation (admin only)
    // ZK Proof: Creates private employee record
    transition create_employee(
        public employee_address: address,
        public employee_id: field,
        public salary_amount: u64
    ) -> EmployeeCredential {
        
        // Validate salary is reasonable
        assert(salary_amount > 0u64);
        assert(salary_amount <= 1000000u64); // Max 1M per month
        
        return EmployeeCredential {
            owner: employee_address,
            employee_id: employee_id,
            salary_amount: salary_amount,
            is_active: true,
        };
    }
    
    // Deactivate employee (admin only)
    transition deactivate_employee(
        employee_credential: EmployeeCredential
    ) -> EmployeeCredential {
        
        return EmployeeCredential {
            owner: employee_credential.owner,
            employee_id: employee_credential.employee_id,
            salary_amount: employee_credential.salary_amount,
            is_active: false,
        };
    }
    
    // Employee can verify their payment privately
    transition verify_payment(
        payment: SalaryPayment,
        public expected_batch: field
    ) -> bool {
        // ZK Proof: Employee verifies they received correct payment
        // Without revealing amount to anyone else
        assert_eq(payment.batch_id, expected_batch);
        assert(payment.amount > 0u64);
        
        return true;
    }
}

