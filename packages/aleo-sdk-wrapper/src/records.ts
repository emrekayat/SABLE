/**
 * SABLE Record Management
 * Functions for managing private Aleo records (Treasury, EmployeeCredential, SalaryPayment)
 */

export interface TreasuryRecord {
  owner: string;
  balance: bigint;
  recordString: string; // Encrypted record from wallet
}

export interface EmployeeCredentialRecord {
  employeeAddress: string;
  employeeId: string;
  salaryAmount: bigint;
  isActive: boolean;
  recordString: string;
}

export interface SalaryPaymentRecord {
  recipient: string;
  amount: bigint;
  batchId: string;
  timestamp: number;
  recordString: string;
}

export interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  walletAddress: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
}

/**
 * Initialize company treasury (one-time setup)
 * Creates a private Treasury record with initial balance
 */
export async function initializeTreasury(
  companyId: string,
  initialBalance: bigint,
  requestTransaction: any
): Promise<TreasuryRecord> {
  try {
    const result = await requestTransaction({
      program: "sable_payroll_zk.aleo",
      function: "initialize_treasury",
      inputs: [
        `${companyId}field`,
        `${initialBalance}u64`
      ],
      fee: 0.5
    });

    // In real implementation, parse the returned record
    // For now, return a mock structure
    return {
      owner: "admin", // Would be extracted from record
      balance: initialBalance,
      recordString: String(result)
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Create employee credential (private record)
 * Each employee gets their own EmployeeCredential record
 */
export async function createEmployeeCredential(
  employee: EmployeeData,
  requestTransaction: any
): Promise<EmployeeCredentialRecord> {
  try {
    // Hash employee ID to field element
    const employeeIdHash = hashToField(employee.id);
    
    const result = await requestTransaction({
      program: "sable_payroll_zk.aleo",
      function: "create_employee",
      inputs: [
        employee.walletAddress,
        `${employeeIdHash}field`,
        `${employee.salary}u64`,
        "true" // isActive
      ],
      fee: 0.3
    });

    return {
      employeeAddress: employee.walletAddress,
      employeeId: employee.id,
      salaryAmount: BigInt(employee.salary),
      isActive: true,
      recordString: String(result)
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Distribute salary to single employee (full privacy)
 * Uses private Treasury and EmployeeCredential records
 */
export async function distributeSalary(
  treasuryRecord: string,
  employeeCredentialRecord: string,
  batchId: string,
  requestTransaction: any
): Promise<{
  salaryPayment: SalaryPaymentRecord;
  updatedTreasury: TreasuryRecord;
}> {
  try {
    const batchIdHash = hashToField(batchId);
    
    const result = await requestTransaction({
      program: "sable_payroll_zk.aleo",
      function: "distribute_private_salary",
      inputs: [
        treasuryRecord,              // Private Treasury record
        employeeCredentialRecord,    // Private EmployeeCredential
        `${batchIdHash}field`       // Public batch ID
      ],
      fee: 0.8
    });

    // Parse result - would contain 3 outputs:
    // 1. SalaryPayment (to employee)
    // 2. Updated Treasury (to admin)
    // 3. EmployeeCredential (unchanged, returned)
    
    return {
      salaryPayment: {
        recipient: "employee_address", // Parse from result
        amount: BigInt(0), // Parse from result
        batchId: batchId,
        timestamp: Date.now(),
        recordString: String(result)
      },
      updatedTreasury: {
        owner: "admin",
        balance: BigInt(0), // Parse from result
        recordString: String(result)
      }
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Process batch of employees (aggregate privacy)
 * Faster than individual distributions, still private treasury
 */
export async function processBatch(
  treasuryRecord: string,
  batchId: string,
  employeeCount: number,
  totalAmount: bigint,
  requestTransaction: any
): Promise<TreasuryRecord> {
  try {
    const batchIdHash = hashToField(batchId);
    
    const result = await requestTransaction({
      program: "sable_payroll_zk.aleo",
      function: "process_private_batch",
      inputs: [
        treasuryRecord,              // Private Treasury record
        `${batchIdHash}field`,       // Public batch ID
        `${employeeCount}u32`,       // Public count
        `${totalAmount}u64`          // Public total (commitment)
      ],
      fee: 1.0
    });

    return {
      owner: "admin",
      balance: BigInt(0), // Parse from result
      recordString: String(result)
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get treasury balance from cached record
 * In production, this would decrypt the record
 */
export function getTreasuryBalance(treasuryRecord: TreasuryRecord): bigint {
  return treasuryRecord.balance;
}

/**
 * Calculate total monthly payroll from employee list
 */
export function calculateTotalPayroll(employees: EmployeeData[]): bigint {
  return employees
    .filter(e => e.isActive)
    .reduce((sum, e) => sum + BigInt(e.salary), BigInt(0));
}

/**
 * Get active employee count
 */
export function getActiveEmployeeCount(employees: EmployeeData[]): number {
  return employees.filter(e => e.isActive).length;
}

/**
 * Hash string to Aleo field element
 * Simplified version - production would use proper Aleo hashing
 */
function hashToField(input: string): string {
  // Simple hash for demo - replace with proper Aleo hash function
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString();
}

/**
 * Generate unique batch ID
 */
export function generateBatchId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `batch_${timestamp}_${random}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: bigint): string {
  const dollars = Number(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(dollars);
}
