// The 'sable_identities' program manages shielded employee identity records.
// This modular approach keeps the program under 100KB and stays within the 31-mapping limit.

program sable_identities.aleo {
    
    // ============================================================================
    // RECORDS - Private Identity Data
    // ============================================================================
    
    // Shielded employee identity - all fields are private by default
    record EmployeeIdentity {
        owner: address,
        employee_id: field,           // Unique identifier (hashed)
        department_code: u32,         // For future Wave 5+ hierarchical view keys
        hire_date: u64,               // Unix timestamp
        access_level: u8,             // 0=regular, 1=manager, 2=admin
        is_active: bool,
    }
    
    // Company identity record for authorization
    record CompanyIdentity {
        owner: address,               // Company address
        company_id: field,            // Unique company identifier
        total_employees: u32,
        authorized_signers: u8,       // Number of required signatures
    }
    
    // View key record for time-limited auditor access (Option A - Wave 1-2)
    record AuditorViewKey {
        owner: address,               // Auditor's address
        company_id: field,            // Which company this key applies to
        issued_at: u64,               // Unix timestamp of issuance
        expires_at: u64,              // Unix timestamp of expiration
        scope: u8,                    // 0=full, 1=tax_only, 2=headcount_only
    }
    
    // ============================================================================
    // MAPPINGS - Public State (Minimal for under 31-mapping limit)
    // ============================================================================
    
    // Track active employees per company (public for compliance)
    mapping company_headcount: field => u32;
    
    // Track total identities issued (public counter)
    mapping identity_counter: field => u32;
    
    // Auditor access log (public for transparency)
    mapping auditor_access_log: field => u64; // auditor_address_hash => last_access_timestamp
    
    // ============================================================================
    // TRANSITIONS - Identity Management
    // ============================================================================
    
    // Initialize a company identity
    transition create_company(
        company_id: field,
        total_employees: u32,
        authorized_signers: u8
    ) -> CompanyIdentity {
        let company: CompanyIdentity = CompanyIdentity {
            owner: self.caller,
            company_id,
            total_employees,
            authorized_signers,
        };
        
        return company then finalize(company_id, total_employees);
    }
    
    async function create_company(company_id: field, total_employees: u32) {
        // Initialize company headcount in public mapping
        company_headcount.set(company_id, total_employees);
        identity_counter.set(company_id, 0u32);
    }
    
    // Register a new shielded employee
    transition register_employee(
        company: CompanyIdentity,
        employee_id: field,
        department_code: u32,
        hire_date: u64,
        access_level: u8,
        new_employee_address: address
    ) -> (CompanyIdentity, EmployeeIdentity) {
        // Only company owner can register employees
        assert_eq(company.owner, self.caller);
        
        let employee: EmployeeIdentity = EmployeeIdentity {
            owner: new_employee_address,
            employee_id,
            department_code,
            hire_date,
            access_level,
            is_active: true,
        };
        
        return (company, employee) then finalize(company.company_id);
    }
    
    async function register_employee(company_id: field) {
        // Increment identity counter
        let current_count: u32 = identity_counter.get_or_use(company_id, 0u32);
        identity_counter.set(company_id, current_count + 1u32);
    }
    
    // Deactivate an employee (soft delete for audit trail)
    transition deactivate_employee(
        employee: EmployeeIdentity
    ) -> EmployeeIdentity {
        // Create new record with is_active set to false
        let deactivated: EmployeeIdentity = EmployeeIdentity {
            owner: employee.owner,
            employee_id: employee.employee_id,
            department_code: employee.department_code,
            hire_date: employee.hire_date,
            access_level: employee.access_level,
            is_active: false,
        };
        
        return deactivated;
    }
    
    // Issue time-limited view key to auditor (Option A - Wave 1-2)
    transition issue_auditor_key(
        company: CompanyIdentity,
        auditor_address: address,
        expires_at: u64,
        scope: u8
    ) -> (CompanyIdentity, AuditorViewKey) {
        // Only company owner can issue view keys
        assert_eq(company.owner, self.caller);
        
        let view_key: AuditorViewKey = AuditorViewKey {
            owner: auditor_address,
            company_id: company.company_id,
            issued_at: 1737331200u64, // Placeholder - would use block.height in production
            expires_at,
            scope,
        };
        
        return (company, view_key) then finalize(company.company_id);
    }
    
    async function issue_auditor_key(company_id: field) {
        // Log auditor access in public mapping for transparency
        auditor_access_log.set(company_id, 1737331200u64); // Placeholder timestamp
    }
    
    // Verify auditor key is still valid (called before granting access)
    transition verify_auditor_access(
        view_key: AuditorViewKey,
        current_time: u64
    ) -> bool {
        // Check if key has expired
        let is_valid: bool = current_time < view_key.expires_at;
        return is_valid;
    }
}
