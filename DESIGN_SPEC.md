# Haven — Frontend Design Spec for Antigravity

## Project Overview

**Haven** is a private escrow service with ZK condition verification on Midnight Network. The backend is complete with 90 tests passing. This document specifies the frontend features, component structure, and design patterns for antigravity to follow.

---

## Design Language (Matching Meridian)

Maintain the exact same visual identity as the Meridian project:

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-void` | `#020203` | Near-black background |
| `--text-primary` | `#f0f0f0` | Primary white text |
| `--text-muted` | `rgba(240, 240, 240, 0.4)` | Muted/secondary text |
| `--accent-gold` | `#c2a878` | Primary accent (labels, buttons, links) |
| `--accent-emerald` | `#34d399` | Success states, active escrows |
| `--accent-crimson` | `#ff5050` | Error states, disputes |
| `--accent-violet` | `#8b5cf6` | Secondary sections |

### Typography
| Font | Usage |
|------|-------|
| `Instrument Serif` (italic) | Headings, display text |
| `Inter` | Body text |
| `JetBrains Mono` | All UI chrome, labels, buttons, inputs, data |

### Component Patterns
- **Cards**: `border: 1px solid rgba(255,255,255,0.08)`, `borderRadius: 8px`, `background: rgba(255,255,255,0.02)`
- **Buttons**: Monospace, uppercase, letter-spacing 0.1em, transparent bg, 1px solid border
- **Labels**: 9px monospace, uppercase, letter-spacing 0.2em, colored to section accent
- **Inputs**: Transparent bg, 1px solid border, monospace font, gold border on focus

### Animations
- Framer Motion for all transitions
- Easing: `[0.16, 1, 0.3, 1]` (deceleration curve)
- Page transitions: `initial={{ opacity: 0, y: 30 }}` → `animate={{ opacity: 1, y: 0 }}`
- Navbar: `initial={{ y: -100, opacity: 0 }}` with delay 0.5

---

## Feature Requirements

### 1. EscrowBoard (Main View)
**Purpose**: Create and manage escrows

**States to display:**
- Not connected → Prompt to connect Lace wallet
- Connected, no escrows → Empty state + "Create Escrow" form
- Connected, has escrows → List of escrows with status badges

**Form fields:**
- Seller Address (text input)
- Amount (number input with token selector)
- Condition (textarea — "What must be delivered?")
- Submit button → Calls `deployEscrow()`

**Escrow list items:**
- Escrow ID (truncated)
- Amount (private — show as "•••••" with reveal toggle)
- Condition (truncated)
- State badge (color-coded)
- Created date
- Action button (based on current state)

### 2. EscrowDetail (Expanded View)
**Purpose**: Show full escrow details and available actions

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Escrow #escrow_1a2b3c4d                    [Close] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ STATE        │  │ AMOUNT       │                │
│  │ ◉ Funded     │  │ ••••• [👁]   │                │
│  └──────────────┘  └──────────────┘                │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ CONDITION                                     │  │
│  │ Deliver 10 units of product X by Sept 30    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ STATE TIMELINE                               │  │
│  │ Created → Funded → ● Delivered → Released    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ ACTIONS                                       │  │
│  │ [Confirm Delivery]  [Raise Dispute]          │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ ON-CHAIN PROOF                               │  │
│  │ Contract: mn_contract_...                    │  │
│  │ Last TX: mn_tx_...                           │  │
│  │ Explorer: [View →]                           │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 3. StateTimeline Component
**Purpose**: Visual representation of escrow progress

**States and colors:**
| State | Color | Icon |
|-------|-------|------|
| Created | Gold `#c2a878` | ○ |
| Funded | Emerald `#34d399` | ◉ |
| Delivered | Violet `#8b5cf6` | ◉ |
| Released | Emerald `#34d399` | ✓ |
| Disputed | Crimson `#ff5050` | ⚠ |
| Resolved | Gold `#c2a878` | ✓ |
| Cancelled | Muted `rgba(240,240,240,0.4)` | ✗ |

**Design**: Horizontal timeline with dots and connecting lines. Current state pulses.

### 4. PrivacyToggle Component
**Purpose**: Show/hide private data (amount, condition)

**Behavior:**
- Default: Shows "•••••" for private fields
- Click eye icon → Reveals actual value with fade animation
- Remember preference in localStorage

### 5. ActionModal Component
**Purpose**: Confirmation modal for escrow actions

**Actions requiring confirmation:**
- Deposit Funds → "You are about to deposit [amount] into escrow. This action is irreversible."
- Confirm Delivery → "You confirm that the delivery conditions have been met."
- Release Funds → "Funds will be released to the seller. This action is irreversible."
- Raise Dispute → "A dispute will be raised. An arbitrator will review the case."
- Cancel Escrow → "The escrow will be cancelled. No funds will be transferred."

**Modal design:**
- Dark overlay with blur
- Centered card with glassmorphic background
- Warning icon for destructive actions
- Two buttons: Cancel (ghost) + Confirm (colored by action)

### 6. WalletStatus Component
**Purpose**: Show connection status in navbar

**States:**
- Disconnected: "CONNECT LACE" button
- Connecting: "CONNECTING..." with spinner
- Connected: Truncated address + green dot + "SYS.ONLINE"

### 7. EscrowStats Component
**Purpose**: Summary statistics on the main view

**Stats to show:**
- Total Escrows (count)
- Active Escrows (count)
- Total Value Locked (sum of amounts — only if user is party to escrows)
- Disputes (count)

**Design**: 4 stat cards in a row, each with icon, label, and value.

### 8. TransactionHistory Component
**Purpose**: Show recent transactions for an escrow

**Data from indexer:**
- Transaction hash (truncated, linked to explorer)
- Block height
- Timestamp
- Action type (Deposit, Confirm, Release, Dispute, Resolve)

---

## Component Tree

```
App
├── MidnightWalletProvider (Context)
│   └── AppContent
│       ├── Preloader (AnimatePresence)
│       ├── CustomCursor
│       ├── LiquidAura (WebGL canvas)
│       ├── noise-overlay (CSS)
│       ├── Navbar
│       │   ├── Logo
│       │   ├── NavLinks (Escrows | Stats)
│       │   └── WalletStatus
│       ├── EscrowBoard (main view)
│       │   ├── EscrowStats
│       │   ├── EscrowList
│       │   │   └── EscrowCard (for each escrow)
│       │   │       ├── StateTimeline
│       │   │       ├── PrivacyToggle
│       │   │       └── ActionButton
│       │   └── CreateEscrowForm
│       ├── EscrowDetail (modal/overlay)
│       │   ├── StateTimeline
│       │   ├── PrivacyToggle (amount, condition)
│       │   ├── ActionModal
│       │   └── TransactionHistory
│       └── Footer
```

---

## Data Flow

```
Wallet (Lace) → MidnightWalletContext → useMidnightWallet()
                                              │
                                              ▼
                                      useEscrowService()
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                   ▼                   ▼
                    deployEscrow()      depositFunds()      releaseFunds()
                    confirmDelivery()   raiseDispute()      resolveDispute()
                    cancelEscrow()
                          │
                          ▼
                  escrowStore (in-memory / Supabase)
                          │
                          ▼
                  UI Components (EscrowBoard, EscrowDetail, etc.)
```

---

## Hook: useEscrowService

```typescript
interface UseEscrowServiceReturn {
    // State
    escrows: EscrowRecord[];
    selectedEscrow: EscrowRecord | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    createEscrow: (request: CreateEscrowRequest) => Promise<EscrowDeploymentResult>;
    deposit: (escrowId: string) => Promise<EscrowActionResult>;
    confirmDelivery: (escrowId: string) => Promise<EscrowActionResult>;
    release: (escrowId: string) => Promise<EscrowActionResult>;
    dispute: (escrowId: string) => Promise<EscrowActionResult>;
    resolve: (escrowId: string) => Promise<EscrowActionResult>;
    cancel: (escrowId: string) => Promise<EscrowActionResult>;

    // Selection
    selectEscrow: (escrowId: string) => void;
    clearSelection: () => void;

    // Refresh
    refresh: () => Promise<void>;
}
```

---

## Key Integration Points

### Service Functions (from backend)

```typescript
import {
    deployEscrow,
    depositFunds,
    confirmDelivery,
    releaseFunds,
    raiseDispute,
    resolveDispute,
    cancelEscrow,
    getEscrow,
    listEscrows,
} from '../../src/escrow';
```

### Types (from backend)

```typescript
import {
    EscrowState,
    ESCROW_STATE_LABELS,
    type EscrowRecord,
    type CreateEscrowRequest,
    type EscrowActionResult,
    type EscrowDeploymentResult,
} from '../../src/escrow';
```

### Verification (from backend)

```typescript
import {
    verifyAmount,
    verifyCondition,
} from '../../src/escrow';
```

---

## State Machine Reference

```
Created ──┬── Funded ──┬── Delivered ──┬── Released
           │            │                │
           │            └── Disputed ── Resolved
           │
           └── Cancelled
```

**Available actions per state:**

| State | Available Actions |
|-------|-------------------|
| Created | Deposit, Cancel |
| Funded | Confirm Delivery, Raise Dispute |
| Delivered | Release Funds, Raise Dispute |
| Released | (none — terminal) |
| Disputed | Resolve Dispute |
| Resolved | (none — terminal) |
| Cancelled | (none — terminal) |

---

## Testing Checklist for Antigravity

- [ ] Wallet connection/disconnection works
- [ ] Create escrow form validates inputs
- [ ] Escrow list displays all escrows
- [ ] State badges show correct colors
- [ ] Privacy toggle shows/hides amounts
- [ ] Action buttons only appear for valid states
- [ ] Confirmation modals display correct warnings
- [ ] State timeline shows correct progression
- [ ] Transaction history loads from indexer
- [ ] Error states display correctly
- [ ] Loading states show spinners
- [ ] Animations match Meridian style
- [ ] Mobile responsive
- [ ] Keyboard accessible
