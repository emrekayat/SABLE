# Contributing to SABLE

Thank you for your interest in contributing to SABLE! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Aleo CLI (for Leo development)
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/your-org/SABLE.git
cd SABLE

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development server
pnpm dev
```

## 🏗️ Project Structure

```
SABLE/
├── apps/
│   └── dashboard/          # Next.js 14 dashboard
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── aleo-sdk-wrapper/   # Aleo SDK integration
│   ├── tsconfig/           # TypeScript configs
│   └── eslint-config/      # ESLint configs
└── leo-programs/
    ├── sable_identities/   # Identity management
    ├── sable_treasury/     # Treasury operations
    └── sable_payroll/      # Payroll distribution
```

## 🤝 How to Contribute

### Reporting Bugs

1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. **Open a discussion** first to gauge interest
2. **Create a feature request** issue with:
   - Use case and problem it solves
   - Proposed solution
   - Alternative solutions considered
   - Impact on existing functionality

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation

4. **Run tests and linting**
   ```bash
   pnpm lint
   pnpm test
   ```

5. **Commit with conventional commits**
   ```bash
   git commit -m "feat(payroll): add batch size validation"
   git commit -m "fix(treasury): resolve allocation overflow"
   git commit -m "docs(architecture): clarify view key strategy"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Await review** and address feedback

## 📝 Coding Standards

### TypeScript/React

- Use functional components with hooks
- Prefer type inference over explicit types when obvious
- Use `const` for immutable values
- Follow Airbnb style guide

```typescript
// ✅ Good
const handleSubmit = async (data: FormData) => {
  const result = await processPayroll(data);
  return result;
};

// ❌ Bad
function handleSubmit(data: any) {
  return processPayroll(data).then((result: any) => result);
}
```

### Leo Programs

- Document all transitions with comments
- Use descriptive variable names
- Keep functions under 50 lines when possible
- Add assertions for critical invariants

```leo
// ✅ Good
transition distribute_salary(
    batch: PayrollBatch,
    employee: ShieldedEmployee,
    payment_amount: u64
) -> (PayrollBatch, SalaryRecord) {
    // Verify employee eligibility
    assert_eq(batch.company_id, employee.department_code as field);
    
    // ... implementation
}

// ❌ Bad
transition ds(b: PayrollBatch, e: ShieldedEmployee, p: u64) -> (PayrollBatch, SalaryRecord) {
    // ... implementation
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// packages/aleo-sdk-wrapper/src/__tests__/sdk.test.ts
import { SableAleoSDK } from "../index";

describe("SableAleoSDK", () => {
  it("should connect wallet successfully", async () => {
    const sdk = new SableAleoSDK();
    const account = await sdk.connectWallet();
    expect(account.address).toMatch(/^aleo1/);
  });
});
```

### Leo Program Tests

```bash
cd leo-programs/sable_payroll
leo test
```

## 🔒 Security

### Reporting Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email security@sable.aleo
2. Include:
   - Vulnerability description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Security Best Practices

- Never commit private keys or secrets
- Use environment variables for sensitive config
- Sanitize user inputs
- Follow principle of least privilege

## 📖 Documentation

### Code Comments

- Document **why**, not **what**
- Use JSDoc for public APIs
- Keep comments up-to-date

```typescript
/**
 * Executes payroll batch with ZK proof generation.
 * 
 * @param config - Batch configuration with employee list
 * @param onProgress - Callback for progress updates
 * @returns Array of transaction hashes
 * 
 * @example
 * ```typescript
 * await sdk.executePayrollBatch(config, (progress) => {
 *   console.log(`${progress.completed}/${progress.total} complete`);
 * });
 * ```
 */
async executePayrollBatch(config: PayrollBatchConfig, onProgress: ProgressCallback): Promise<string[]>
```

### Architecture Docs

Update `docs/ARCHITECTURE.md` for:
- New design decisions
- Major refactors
- Protocol changes

## 🌟 Community

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:
- Be respectful and professional
- Assume good intent
- Give constructive feedback
- Focus on what's best for the community

### Getting Help

- **Discord**: https://discord.com/invite/sable
- **GitHub Discussions**: For questions and ideas
- **Stack Overflow**: Tag with `sable-aleo`

## 🎉 Recognition

Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Credited in release notes
- Invited to community calls

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making SABLE better! 🙏**
