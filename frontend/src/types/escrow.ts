export enum EscrowState {
  Created = 0,
  Funded = 1,
  Delivered = 2,
  Released = 3,
  Disputed = 4,
  Resolved = 5,
  Cancelled = 6,
}

export const ESCROW_STATE_LABELS: Record<EscrowState, string> = {
  [EscrowState.Created]: 'Created',
  [EscrowState.Funded]: 'Funded',
  [EscrowState.Delivered]: 'Delivered',
  [EscrowState.Released]: 'Released',
  [EscrowState.Disputed]: 'Disputed',
  [EscrowState.Resolved]: 'Resolved',
  [EscrowState.Cancelled]: 'Cancelled',
};

export interface EscrowRecord {
  id: string;
  contractAddress: string;
  buyerAddress: string;
  sellerAddress: string;
  amount: string;
  token?: string;
  condition: string;
  state: EscrowState;
  stateLabel: string;
  createdAt: string;
  updatedAt: string;
  fundedAt: string | null;
  deliveredAt: string | null;
  releasedAt: string | null;
  disputedAt: string | null;
  resolvedAt: string | null;
  cancelledAt: string | null;
  transactionHash: string;
  buyerSecret: string;
  sellerSecret: string;
  salt: string;
}

export interface CreateEscrowRequest {
  buyerAddress: string;
  sellerAddress: string;
  amount: string;
  token?: string;
  condition: string;
}

export interface EscrowDeploymentResult {
  contractAddress: string;
  transactionHash: string;
  buyerCommitment: string;
  sellerCommitment: string;
  amountCommitment: string;
  conditionCommitment: string;
  escrowId: string;
}

export interface EscrowActionResult {
  success: boolean;
  transactionHash: string;
  blockHeight: number;
  newState: EscrowState;
  error?: string;
}

export interface EscrowTransaction {
  hash: string;
  blockHeight: number;
  timestamp: string;
  type: string;
  stateLabel: string;
}
