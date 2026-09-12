# Haven

Private Escrow, Shielded.

## Overview

Haven is a decentralized escrow service built on Midnight Network. It uses zero-knowledge proofs to keep amounts, conditions, and participant identities private while maintaining verifiable state on-chain.

## Features

- **Private Amounts**: Escrow amounts are committed on-chain as ZK hashes
- **Private Conditions**: Delivery conditions are never revealed publicly
- **Anonymous Parties**: Buyer and seller identities are hidden behind commitments
- **Verifiable State**: State transitions are public and verifiable
- **Dispute Resolution**: Built-in dispute mechanism with selective disclosure

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ EscrowBoard  │  │ Dispute      │  │  Midnight       │   │
│  │              │  │ Resolution   │  │  Wallet         │   │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────┘   │
│         │                │                      │           │
│         └────────────────┼──────────────────────┘           │
│                          │                                  │
│                    ┌─────▼─────┐                            │
│                    │ useEscrow │                            │
│                    │ Service   │                            │
│                    └─────┬─────┘                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Midnight.js SDK       │
              │   (ZK Circuit Exec)     │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   Midnight Network      │
              │   (Preprod Testnet)     │
              └─────────────────────────┘
```

## Privacy Model

### What an observer can learn

| Data point | Where |
|------------|-------|
| Escrow exists | On-chain commitment hashes |
| Current state | `escrowState` counter |
| Number of deposits | `depositCount` on-chain |
| Number of disputes | `disputeCount` on-chain |
| When actions occurred | Transaction hashes, timestamps |

### What an observer cannot learn

| Data point | Why it stays private |
|------------|----------------------|
| Escrow amount | Committed on-chain as hash |
| Delivery condition | Committed on-chain as hash |
| Buyer identity | Private witness |
| Seller identity | Private witness |
| Specific terms | Never leaves client |

## State Machine

```
Created ──┬── Funded ──┬── Delivered ──┬── Released
           │            │                │
           │            └── Disputed ── Resolved
           │
           └── Cancelled
```

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+
- Compact CLI 0.5+
- Lace Wallet (browser extension)
- Supabase account (for persistence)

### Installation

```bash
# Clone the repository
git clone https://github.com/Anubhab-Rakshit/haven.git
cd haven

# Install dependencies
npm install

# Compile the contract
npm run compile:escrow
```

### Supabase Setup (optional, for persistence)

```bash
# 1. Create a project at https://supabase.com
# 2. Run supabase/schema.sql in the SQL Editor
# 3. Copy the env file and fill in your values
cp .env.supabase.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set, escrow records persist across restarts. Without them, data lives in memory (resets on restart).

### Development

```bash
# Run tests
npm test

# Run type checker
npm run typecheck

# Run linter
npm run lint

# Run E2E test (requires proof server + funded wallet)
npm run test:e2e

# Run frontend
npm run frontend:dev

# Build frontend
npm run frontend:build
```

### Deployment

```bash
# Deploy to local devnet
npm run deploy:escrow -- --network undeployed

# Deploy to preprod
npm run deploy:escrow -- --network preprod
```

### Deployed Contract (Preprod)

| Field | Value |
|-------|-------|
| Contract Address | `c1948db2a7c3a8b9c632ddfe1b9a164daa2f6e19b707bc06f4b2d5f93576bf7b` |
| Transaction | `c6a03985a33af45525fb0c3689bfb2ad979696b4df55c98e188d1f971e05898f` |
| Buyer Secret | `3f08d9865e1e44b1ad1c3f4451daa6ef` |
| Seller Secret | `0e008e2c6d5042c390d4bcb6efadc6b9` |

### E2E Integration Test

```bash
# Start proof server
docker compose up -d

# Run the E2E test against preprod
npm run test:e2e
```

## API Reference

### Service Functions

```typescript
import { deployEscrow, depositFunds, confirmDelivery, releaseFunds } from './src/escrow';

// Deploy a new escrow
const result = await deployEscrow({
    buyerAddress: 'mn_buyer_1',
    sellerAddress: 'mn_seller_1',
    amount: '1000',
    condition: 'Deliver 10 units of product X'
}, provider);

// Deposit funds
await depositFunds(result.escrowId, buyerSecret, provider);

// Confirm delivery
await confirmDelivery(result.escrowId, sellerSecret, provider);

// Release funds
await releaseFunds(result.escrowId, buyerSecret, provider);
```

### Verification Functions

```typescript
import { verifyStateTransition, verifyAmount, verifyCondition } from './src/escrow';

// Verify a state transition is valid
const transition = verifyStateTransition(EscrowState.Created, EscrowState.Funded);
console.log(transition.valid); // true

// Verify an amount is valid
const amount = verifyAmount('1000');
console.log(amount.valid); // true

// Verify a condition is valid
const condition = verifyCondition('Deliver goods');
console.log(condition.valid); // true
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npx vitest run tests/service.test.ts

# Run with coverage
npm run test:coverage
```

## License

Apache-2.0

---

**Haven** · Midnight Buildathon 2026

*Built with ❤️ by [Anubhab Rakshit](https://github.com/Anubhab-Rakshit)*
