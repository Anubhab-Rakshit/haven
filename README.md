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

### Installation

```bash
# Clone the repository
git clone https://github.com/Anubhab-Rakshit/midnight-lock.git
cd midnight-lock

# Install dependencies
npm install

# Compile the contract
npm run compile:escrow
```

### Development

```bash
# Run tests
npm test

# Run type checker
npm run typecheck

# Run linter
npm run lint
```

### Deployment

```bash
# Deploy to local devnet
npm run deploy:escrow -- --network undeployed

# Deploy to preprod
npm run deploy:escrow -- --network preprod
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
