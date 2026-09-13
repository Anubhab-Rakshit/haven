<div align="center">

<img src="./haven-icon.png" alt="Haven" width="120" />

# Haven

### Private, Zero-Knowledge Escrow on the Midnight Blockchain

Shielded amounts · Privacy-preserving escrow — funds held in real shielded tokens,
transitions proven with ZK circuits, identities never revealed on-chain.

</div>

---

<table>
<tr>
<td>

## 📍 Stack

</td>
<td>

[![Midnight](https://img.shields.io/badge/Midnight%20Compact-0.23-6a5acd?style=flat-square)](https://midnight.network)
[![Zero-Knowledge](https://img.shields.io/badge/Zero--Knowledge%20Proofs-Compact-9b59b6?style=flat-square)](#-privacy-model)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)]()
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js&logoColor=white)]()
[![Express](https://img.shields.io/badge/Express-5.x-000?style=flat-square&logo=express&logoColor=white)]()
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)]()
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)]()
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)]()
[![Zig](https://img.shields.io/badge/Zig-%23F7A41D?style=flat-square&logo=zig&logoColor=white)]()

</td>
</tr>
</table>

---

## 📑 Contents

- [Features](#-features)
- [How It Works](#-how-it-works)
- [Privacy Model](#-privacy-model)
- [State Machine](#-state-machine)
- [Architecture](#-architecture)
- [Project Layout](#-project-layout)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Presentation](#-presentation)
- [Security & Disclaimer](#-security--disclaimer)

---

## ✨ Features

| Feature | What it means |
|---------|---------------|
| 🔒 **Real shielded escrow** | Funds are minted as shielded Midnight tokens held *by the contract itself* — not a mock balance |
| 🧾 **Zero-knowledge circuits** | Every state transition is proven with a Compact circuit and verified on-chain |
| 🛡️ **Private by default** | Amounts, conditions, and identities are committed as hashes; observers see only public state counters |
| ⚖️ **Built-in dispute lifecycle** | `dispute → resolve` with a full state machine, gated by the right private keys |
| 🔁 **Restart-safe** | Each deposit's Merkle coin index is persisted, so `release` works after a server restart |
| 🗄️ **Supabase persistence** | Escrow records, their state, and their on-chain coin index outlive the process |
| 🖥️ **Frontend dashboard** | Vite + React UI over a typed Express API |

---

## 🧠 How It Works

Haven deploys an on-chain **escrow contract** (Compact) that acts as the shielded
custodian. Rather than a trivial "flip a boolean", the contract **mints and holds
a real shielded token** representing the escrowed amount:

1. **Deploy** — buyer deploys the escrow; amount/condition/side identities are
   committed as hashes. Nothing sensitive is revealed.
2. **Deposit (mint)** — the buyer's circuit mints a shielded coin of `value` to
   the contract. The minted coin's Merkle-tree index (`mt_index`) is read back
   from the indexer and **persisted**, so the coin can be spent later.
3. **Confirm delivery** — the seller proves delivery; state → `Delivered`.
4. **Release** — the buyer's circuit spends the *same* shielded coin, sending it
   to the seller's shielded coin key. The contract's Merkle-tree index is used
   (persisted), removing the need to pass it from the frontend.
5. **Cancel / Dispute / Resolve** — covered by the state machine below.

### Why `mt_index` matters and how it's handled

Shielded coins live in a Merkle tree; spending a coin requires proving its
position (`mt_index`). When the contract *mints* a coin, the index is assigned
by the network only after the deposit transaction confirms. Haven resolves this
from the **indexer** on deposit, then **persists it** to Supabase — so
`release`/`cancel` work across server restarts without hardcoding anything.

---

## 🕶️ Privacy Model

Everything sensitive is a **commitment** (ZK hash) — only its shadow touches the
ledger.

| On-chain (public) | Kept private |
|-------------------|--------------|
| Escrow state counter | Escrow **amount** |
| Number of deposits / disputes | **Delivery condition** |
| Party **commitments** (hashes) | Party **identities** |
| Public transaction hashes | Commercial **terms** |

---

## ⚙️ State Machine

```
Created ──deposit──▶ Funded ──confirmDelivery──▶ Delivered ──release──▶ Released
   │                    │                            │
   │                    └──dispute──▶ Disputed ──resolve──▶ Resolved
   │                                                   
   └──cancel──▶ Cancelled   (also available from Funded)
```

| From | Circuit | To | Authorized by |
|------|---------|----|---------------|
| Created | `deposit` (mint) | Funded | buyer secret |
| Funded | `confirmDelivery` | Delivered | seller secret |
| Delivered | `release` (spend coin) | Released | buyer secret + seller pub key |
| Created/Funded | `cancel` (spend coin) | Cancelled | buyer secret |
| Funded/Delivered | `dispute` | Disputed | buyer **or** seller |
| Disputed | `resolve` | Resolved | seller-or-buyer (arbiter) secret |

---

## 🏗️ Architecture

```
┌──────────────────────────┐        ┌──────────────────────────────┐
│      React + Vite         │        │  Express API server          │
│  (frontend / :5173)      │        │  (src/server.ts / :3001)     │
│                          │  HTTP   │                              │
│  Escrow dashboard UI     │──────▶  │  action handlers             │
└──────────────────────────┘        │  circuit orchestration       │
                                    └──────────────┬───────────────┘
                                                   │ midnight-js
                                    ┌──────────────▼───────────────┐
                                    │  Wallet (midnight.js)         │
                                    │  • balance/submit transactions│
                                    │  • shield coins to contracts  │
                                    └──────┬──────────────┬─────────┘
                                           │              │
                              ┌────────────▼──┐   ┌───────▼──────────┐
                              │  Indexer      │   │  Proof server    │
                              │  (GQL events) │   │  (ZK proofs)     │
                              └───────────────┘   └──────────────────┘
                                           │
                              ┌────────────▼──────────┐
                              │  Supabase              │
                              │  escrows + coin index  │
                              └───────────────────────┘
```

---

## 📁 Project Layout

```
haven/
├── contracts/              # Compact escrow source + compiled artifacts
├── src/
│   ├── server.ts           # Express API + action orchestration
│   ├── midnight-client.ts  # wallet + circuit orchestration
│   └── network.ts          # network config / client bootstrap
├── frontend/               # Vite + React dashboard (:5173)
├── supabase/schema.sql     # DB schema
└── package.json
```

---

## 🔌 API Reference

Base URL: `http://localhost:3001`

| Endpoint | Method | Body |
|----------|--------|------|
| `/api/health` | GET | — |
| `/api/escrows` | GET | `?buyerAddress=` |
| `/api/escrows` | POST | `{ buyerAddress, sellerAddress, amount, condition }` |
| `/api/escrows/:id/action` | POST | `{ action: 'deposit', value }` |
| `/api/escrows/:id/action` | POST | `{ action: 'confirmDelivery' }` |
| `/api/escrows/:id/action` | POST | `{ action: 'release', sellerPubKey }` |
| `/api/escrows/:id/action` | POST | `{ action: 'cancel' }` |
| `/api/escrows/:id/action` | POST | `{ action: 'dispute' }` |
| `/api/escrows/:id/action` | POST | `{ action: 'resolve' }` |
| `/api/wallet/public-key` | GET | — |

> **Note:** `release`/`cancel` automatically use the persisted `deposit_coin_index`
> — the frontend no longer needs to send the Merkle index.

```sh
# Deploy
curl -X POST http://localhost:3001/api/escrows \
  -H "Content-Type: application/json" \
  -d '{"buyerAddress":"tz1buyer","sellerAddress":"tz1seller","amount":"1000","condition":"deliver-goods"}'

# Deposit (mints a shielded coin + persists its index)
curl -X POST http://localhost:3001/api/escrows/<id>/action \
  -H "Content-Type: application/json" \
  -d '{"action":"deposit","value":"1000"}'

# Confirm delivery
curl -X POST http://localhost:3001/api/escrows/<id>/action \
  -H "Content-Type: application/json" \
  -d '{"action":"confirmDelivery"}'

# Release (uses persisted coin index)
curl -X POST http://localhost:3001/api/escrows/<id>/action \
  -H "Content-Type: application/json" \
  -d '{"action":"release","sellerPubKey":"<32-byte shield key hex>"}'
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 22+
- [npm](https://www.npmjs.com) 10+
- A funded [Midnight](https://midnight.network) wallet (preprod testnet)
- A running proof server (Midnight Compact developer stack)

### Install

```bash
git clone https://github.com/Anubhab-Rakshit/haven.git
cd haven
npm install
npm run dev        # API on :3001
npm run frontend   # dashboard on :5173
```

### Supabase (persistence)

Create a Supabase project Secretory, run `supabase/schema.sql` in the SQL editor,
then **one** line to enable restart-safe coin release:

```sql
ALTER TABLE escrows ADD COLUMN deposit_coin_index BIGINT;
```

---

## ⚙️ Configuration

Environment variables are loaded from `.env.local`:

```dotenv
# Midnight network
MIDNIGHT_NETWORK=preprod
MIDNIGHT_INDEXER_URL=https://indexer.preprod.midnight.network
MIDNIGHT_PROOF_SERVER_URL=http://127.0.0.1:6300

# Wallet
MIDNIGHT_WALLET_SEED=<32-byte hex>

# Supabase (optional — persistence across restarts)
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon key>
```

---

## ✅ Testing

```bash
npm run typecheck   # TypeScript
npm run lint        # oxlint
```

---

## 🧪 Demo / Verification

A full end-to-end happy path (deploy → deposit → confirm → release) was verified
on the **preprod testnet**: each escrow goes through `Deposited → Delivered →
Released` with a persisted on-chain coin index.

---

## 🚢 Deployment

### Backend — Render

The API server and Midnight proof server are deployed on [Render](https://render.com).

**API Server** (`haven-api`):

| Field | Value |
|-------|-------|
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `node dist/index.js` |
| Plan | Free |

**Proof Server** (`haven-proof-server`):

| Field | Value |
|-------|-------|
| Runtime | Docker |
| Dockerfile Path | `Dockerfile.proof-server` |
| Plan | Free |

**Environment variables** (set in Render Dashboard → Settings → Environment):

| Key | Value |
|-----|-------|
| `MIDNIGHT_NETWORK` | `preprod` |
| `MIDNIGHT_INDEXER_URL` | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| `MIDNIGHT_INDEXER_WS_URL` | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` |
| `MIDNIGHT_NODE_URL` | `https://rpc.preprod.midnight.network` |
| `MIDNIGHT_WALLET_SEED` | your funded wallet seed (32-byte hex) |
| `MIDNIGHT_PROOF_SERVER_URL` | `http://haven-proof-server.onrender.com` |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_ANON_KEY` | your Supabase anon key |
| `NODE_ENV` | `production` |

> Deploy the proof server first, wait for it to go green, then deploy the API server.

### Frontend — Vercel

The React dashboard is deployable to [Vercel](https://vercel.com).

```bash
# In the frontend/ directory
cd frontend
```

**Vercel Dashboard** → Import Git Repository → set:

| Env Variable | Value |
|-------------|-------|
| `VITE_API_URL` | `https://haven-api-jce5.onrender.com` |
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |

> Build settings: Framework Preset = **Vite**, Root Directory = `frontend`, Build Command = `npm run build`, Output = `dist`.

---

## 📊 Presentation

- [YouTube Demo](https://youtu.be/0P_jHy5MmYY)
- [Google Drive (PDF)](https://drive.google.com/drive/folders/1mEbKVhLZVYf2HLSWu-tRkbF8SKgX4_01?usp=sharing)
- Local copy: [`Haven_Presentation.pdf`](./Haven_Presentation.pdf)

---

## ⚠️ Security & Disclaimer

**Hackathon project** — not audited, not for production. Secrets are handled
server-side for demo simplicity; a real deployment would keep buyer/seller
secrets exclusively in the edge wallet. Proof generation requires a trusted
Midnight proof server.

---

## 🗓️ Roadmap

- [x] Shielded-on-chain escrow (real token custody)
- [x] Restart-safe coin release (persisted `mt_index`)
- [x] Full state machine: deposit/confirm/release/cancel/dispute/resolve
- [ ] Trustless arbitration UI
- [ ] Multi-signature governance
- [ ] Frontend release with wallet-side key selection

---

<div align="center">

Built during the **Midnight Buildathon** · [Anubhab Rakshit](https://github.com/Anubhab-Rakshit)

</div>
</content>