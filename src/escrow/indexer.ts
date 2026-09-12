import type { OnChainEscrowState, EscrowTransaction } from "./types";

// ─── Indexer Queries ───────────────────────────────────────────────────────────
// GraphQL queries for fetching escrow state from the Midnight network indexer.

const INDEXER_URL =
    process.env.MIDNIGHT_INDEXER_URL ??
    "https://indexer.preprod.midnight.network/api/v4/graphql";

// ─── GraphQL Queries ───────────────────────────────────────────────────────────

const GET_CONTRACT_STATE = `
  query GetContractState($address: String!) {
    contractState(address: $address) {
      buyerCommitment
      sellerCommitment
      amountCommitment
      conditionCommitment
      escrowState
      depositCount
      disputeCount
    }
  }
`;

const GET_CONTRACT_TRANSACTIONS = `
  query GetContractTransactions($address: String!, $limit: Int) {
    transactions(
      where: { contractAddress: { _eq: $address } }
      order_by: { blockHeight: desc }
      limit: $limit
    ) {
      hash
      blockHeight
      timestamp
      type
    }
  }
`;

const GET_LATEST_BLOCK = `
  query GetLatestBlock {
    blocks(order_by: { height: desc }, limit: 1) {
      height
      hash
      timestamp
    }
  }
`;

// ─── Fetch Functions ───────────────────────────────────────────────────────────

/**
 * Fetches the on-chain state of an escrow contract.
 */
export async function fetchEscrowState(
    contractAddress: string,
): Promise<OnChainEscrowState | null> {
    try {
        const response = await fetch(INDEXER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: GET_CONTRACT_STATE,
                variables: { address: contractAddress },
            }),
        });

        const data = (await response.json()) as {
            errors?: unknown[];
            data?: { contractState?: OnChainEscrowState };
        };

        if (data.errors) {
            console.error("Indexer errors:", data.errors);
            return null;
        }

        return data.data?.contractState ?? null;
    } catch (error) {
        console.error("Failed to fetch escrow state:", error);
        return null;
    }
}

/**
 * Fetches transactions for an escrow contract.
 */
export async function fetchEscrowTransactions(
    contractAddress: string,
    limit = 10,
): Promise<EscrowTransaction[]> {
    try {
        const response = await fetch(INDEXER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: GET_CONTRACT_TRANSACTIONS,
                variables: { address: contractAddress, limit },
            }),
        });

        const data = (await response.json()) as {
            errors?: unknown[];
            data?: { transactions?: EscrowTransaction[] };
        };

        if (data.errors) {
            console.error("Indexer errors:", data.errors);
            return [];
        }

        return data.data?.transactions ?? [];
    } catch (error) {
        console.error("Failed to fetch escrow transactions:", error);
        return [];
    }
}

/**
 * Fetches the latest block information.
 */
export async function fetchLatestBlock(): Promise<{
    height: number;
    hash: string;
    timestamp: string;
} | null> {
    try {
        const response = await fetch(INDEXER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: GET_LATEST_BLOCK }),
        });

        const data = (await response.json()) as {
            errors?: unknown[];
            data?: {
                blocks?: {
                    height: number;
                    hash: string;
                    timestamp: string;
                }[];
            };
        };

        if (data.errors) {
            console.error("Indexer errors:", data.errors);
            return null;
        }

        return data.data?.blocks?.[0] ?? null;
    } catch (error) {
        console.error("Failed to fetch latest block:", error);
        return null;
    }
}

// ─── Convenience Functions ─────────────────────────────────────────────────────

/**
 * Checks if a contract exists on-chain by attempting to fetch its state.
 */
export async function contractExists(
    contractAddress: string,
): Promise<boolean> {
    const state = await fetchEscrowState(contractAddress);
    return state !== null;
}

/**
 * Gets a summary of the on-chain escrow state.
 */
export async function getEscrowSummary(contractAddress: string): Promise<{
    exists: boolean;
    state: number;
    deposits: number;
    disputes: number;
    lastTransaction: EscrowTransaction | null;
}> {
    const [state, transactions] = await Promise.all([
        fetchEscrowState(contractAddress),
        fetchEscrowTransactions(contractAddress, 1),
    ]);

    return {
        exists: state !== null,
        state: state?.escrowState ?? -1,
        deposits: state?.depositCount ?? 0,
        disputes: state?.disputeCount ?? 0,
        lastTransaction: transactions[0] ?? null,
    };
}
