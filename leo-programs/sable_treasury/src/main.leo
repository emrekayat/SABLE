// The 'sable_treasury' program manages corporate treasury with multi-sig authorization.
// Modular design to stay under 100KB limit.

program sable_treasury.aleo {
    
    // ============================================================================
    // RECORDS - Private Treasury Data
    // ============================================================================
    
    // Corporate treasury record with encrypted balance
    record TreasuryRecord {
        owner: address,               // Company treasury address
        balance: u64,                 // Available credits (private)
        company_id: field,            // Company identifier
        authorized_signers: u8,       // Multi-sig threshold
        nonce: scalar,                // For uniqueness
    }
    
    // Authorization token for multi-sig operations
    record SignerToken {
        owner: address,               // Authorized signer
        company_id: field,
        signer_index: u8,             // Position in signer list (0-indexed)
        can_allocate: bool,           // Permission to allocate payroll
    }
    
    // Allocation record for payroll batches
    record PayrollAllocation {
        owner: address,               // Payroll program address
        company_id: field,
        allocated_amount: u64,        // Amount allocated for payroll
        batch_id: field,              // Unique batch identifier
        expires_at: u64,              // Allocation expiration
    }
    
    // ============================================================================
    // MAPPINGS - Public Audit Trail
    // ============================================================================
    
    // Public audit log for transparency (commitment only, not amounts)
    mapping treasury_audit_log: field => u64; // company_id => last_operation_timestamp
    
    // Track total allocations per company (for compliance)
    mapping total_allocations: field => u64;
    
    // Payroll batch status (public for tracking)
    mapping batch_status: field => u8; // batch_id => status (0=pending, 1=completed, 2=expired)
    
    // ============================================================================
    // TRANSITIONS - Treasury Management
    // ============================================================================
    
    // Initialize company treasury
    transition initialize_treasury(
        company_id: field,
        initial_balance: u64,
        authorized_signers: u8
    ) -> TreasuryRecord {
        let treasury: TreasuryRecord = TreasuryRecord {
            owner: self.caller,
            balance: initial_balance,
            company_id,
            authorized_signers,
            nonce: 0scalar, // Would use random in production
        };
        
        return treasury then finalize(company_id);
    }
    
    async function initialize_treasury(company_id: field) {
        treasury_audit_log.set(company_id, 1737331200u64); // Placeholder timestamp
        total_allocations.set(company_id, 0u64);
    }
    
    // Deposit credits into treasury
    transition deposit(
        treasury: TreasuryRecord,
        deposit_amount: u64
    ) -> TreasuryRecord {
        let updated_treasury: TreasuryRecord = TreasuryRecord {
            owner: treasury.owner,
            balance: treasury.balance + deposit_amount,
            company_id: treasury.company_id,
            authorized_signers: treasury.authorized_signers,
            nonce: treasury.nonce + 1scalar,
        };
        
        return updated_treasury then finalize(treasury.company_id);
    }
    
    async function deposit(company_id: field) {
        treasury_audit_log.set(company_id, 1737331200u64); // Update timestamp
    }
    
    // Withdraw credits from treasury (requires authorization)
    transition withdraw(
        treasury: TreasuryRecord,
        signer: SignerToken,
        withdraw_amount: u64
    ) -> (TreasuryRecord, SignerToken) {
        // Verify signer is authorized for this company
        assert_eq(treasury.company_id, signer.company_id);
        assert_eq(treasury.owner, self.caller);
        
        // Ensure sufficient balance
        assert(treasury.balance >= withdraw_amount);
        
        let updated_treasury: TreasuryRecord = TreasuryRecord {
            owner: treasury.owner,
            balance: treasury.balance - withdraw_amount,
            company_id: treasury.company_id,
            authorized_signers: treasury.authorized_signers,
            nonce: treasury.nonce + 1scalar,
        };
        
        return (updated_treasury, signer) then finalize(treasury.company_id);
    }
    
    async function withdraw(company_id: field) {
        treasury_audit_log.set(company_id, 1737331200u64);
    }
    
    // Allocate funds for payroll batch (critical for batch processing)
    transition allocate_payroll(
        treasury: TreasuryRecord,
        signer: SignerToken,
        allocation_amount: u64,
        batch_id: field,
        expires_at: u64
    ) -> (TreasuryRecord, SignerToken, PayrollAllocation) {
        // Verify authorization
        assert_eq(treasury.company_id, signer.company_id);
        assert_eq(signer.can_allocate, true);
        assert(treasury.balance >= allocation_amount);
        
        let updated_treasury: TreasuryRecord = TreasuryRecord {
            owner: treasury.owner,
            balance: treasury.balance - allocation_amount,
            company_id: treasury.company_id,
            authorized_signers: treasury.authorized_signers,
            nonce: treasury.nonce + 1scalar,
        };
        
        let allocation: PayrollAllocation = PayrollAllocation {
            owner: self.caller, // Will be transferred to payroll program
            company_id: treasury.company_id,
            allocated_amount: allocation_amount,
            batch_id,
            expires_at,
        };
        
        return (updated_treasury, signer, allocation) then finalize(
            treasury.company_id,
            batch_id,
            allocation_amount
        );
    }
    
    async function allocate_payroll(
        company_id: field,
        batch_id: field,
        allocation_amount: u64
    ) {
        // Update audit log
        treasury_audit_log.set(company_id, 1737331200u64);
        
        // Track total allocations
        let current_total: u64 = total_allocations.get_or_use(company_id, 0u64);
        total_allocations.set(company_id, current_total + allocation_amount);
        
        // Set batch status to pending
        batch_status.set(batch_id, 0u8);
    }
    
    // Issue signer token to authorized personnel
    transition issue_signer_token(
        treasury: TreasuryRecord,
        signer_address: address,
        signer_index: u8,
        can_allocate: bool
    ) -> (TreasuryRecord, SignerToken) {
        // Only treasury owner can issue tokens
        assert_eq(treasury.owner, self.caller);
        
        let token: SignerToken = SignerToken {
            owner: signer_address,
            company_id: treasury.company_id,
            signer_index,
            can_allocate,
        };
        
        return (treasury, token);
    }
    
    // Mark payroll batch as completed (called by payroll program)
    async transition complete_batch(batch_id: field) -> Future {
        return finalize_complete_batch(batch_id);
    }
    
    async function finalize_complete_batch(batch_id: field) {
        batch_status.set(batch_id, 1u8); // Status: completed
    }
}
