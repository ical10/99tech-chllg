import React, { useMemo } from 'react';

// Mock imports - these should be properly imported in a real application
interface BoxProps {
  children?: React.ReactNode;
  className?: string;
}

// Assuming these hooks exist
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;

// Assuming WalletRow component exists
declare const WalletRow: React.FC<{
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}>;

// Assuming classes object exists
declare const classes: {
  row: string;
};

/**
 * Enum for supported blockchain networks
 * Issue #3 Fix: Replace `any` type with proper enum
 */
enum Blockchain {
  Osmosis = 'Osmosis',
  Ethereum = 'Ethereum',
  Arbitrum = 'Arbitrum',
  Zilliqa = 'Zilliqa',
  Neo = 'Neo',
}

/**
 * Unified interface for wallet balance
 * Issue #1 Fix: Combined WalletBalance and FormattedWalletBalance
 * Added missing `blockchain` property
 */
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

/**
 * Extended interface with computed properties
 */
interface EnrichedWalletBalance extends WalletBalance {
  priority: number;
  formatted: string;
  usdValue: number;
}

/**
 * Props interface
 * Issue #2 Fix: Properly typed with BoxProps
 */
interface Props extends BoxProps { }

/**
 * Static blockchain priority mapping
 * Issue #6 Fix: Pre-computed priorities to avoid redundant function calls
 * Zero function calls - just O(1) object lookups
 */
const BLOCKCHAIN_PRIORITIES: Record<string, number> = {
  [Blockchain.Osmosis]: 100,
  [Blockchain.Ethereum]: 50,
  [Blockchain.Arbitrum]: 30,
  [Blockchain.Zilliqa]: 20,
  [Blockchain.Neo]: 20,
};

const DEFAULT_PRIORITY = -99;
const MIN_VALID_PRIORITY = -99;
const MIN_VALID_AMOUNT = 0;

/**
 * Get blockchain priority from static mapping
 * Issue #6 Fix: Using static lookup instead of switch statement
 * @param blockchain - The blockchain identifier
 * @returns Priority number for sorting
 */
const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? DEFAULT_PRIORITY;
};

/**
 * Format amount to string with fixed decimal places
 * @param amount - The numeric amount to format
 * @returns Formatted string representation
 */
const formatAmount = (amount: number): string => {
  return amount.toFixed(2); // Using 2 decimal places for currency
};

/**
 * Safely calculate USD value with error handling
 * Issue #12 Fix: Added validation for missing currency prices
 * @param currency - Currency code
 * @param amount - Token amount
 * @param prices - Price mapping object
 * @returns USD value or 0 if price unavailable
 */
const calculateUsdValue = (
  currency: string,
  amount: number,
  prices: Record<string, number>
): number => {
  const price = prices[currency];
  if (typeof price !== 'number' || isNaN(price)) {
    console.warn(`Price not available for currency: ${currency}`);
    return 0;
  }
  return price * amount;
};

/**
 * WalletPage component - displays sorted and filtered wallet balances
 * 
 * Fixes applied:
 * - Issue #1: Unified interfaces
 * - Issue #2: Proper imports and references
 * - Issue #3: Removed `any` types, using proper types
 * - Issue #4: Fixed inverted filter logic
 * - Issue #5: Corrected useMemo dependencies
 * - Issue #6: Pre-computed priorities
 * - Issue #7: Removed unused formattedBalances
 * - Issue #8: Added missing return value in sort
 * - Issue #9: Fixed type annotations
 * - Issue #10: Using currency as React key
 * - Issue #11: Memoized rows
 * - Issue #12: Added error handling
 */
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;

  // Hook calls
  const balances = useWalletBalances();
  const prices = usePrices();

  /**
   * Process, filter, and sort wallet balances
   * Issue #5 Fix: Removed `prices` from dependencies (not used in computation)
   * Issue #6 Fix: Map priorities once using static lookup
   * Issue #4 Fix: Corrected filter logic (was inverted)
   * Issue #8 Fix: Added return 0 for equal priorities
   */
  const sortedBalances = useMemo(() => {
    // Issue #12 Fix: Handle edge case of undefined/null balances
    if (!Array.isArray(balances)) {
      console.error('Invalid balances array');
      return [];
    }

    return (
      balances
        .map((balance) => ({
          ...balance,
          priority: getPriority(balance.blockchain),
        }))
        // Issue #4 Fix: Inverted logic - now correctly filters OUT invalid balances
        .filter(
          (balance) =>
            balance.priority > MIN_VALID_PRIORITY &&
            balance.amount > MIN_VALID_AMOUNT
        )
        // Issue #8 Fix: Returns 0 when priorities are equal
        .sort((lhs, rhs) => {
          const priorityDiff = rhs.priority - lhs.priority;
          // If priorities are equal, sort by amount descending as tiebreaker
          return priorityDiff !== 0 ? priorityDiff : rhs.amount - lhs.amount;
        })
    );
  }, [balances]); // Issue #5 Fix: Only depends on balances, not prices

  /**
   * Generate formatted rows with USD values
   * Issue #7 Fix: Integrated formatting into rows (removed unused formattedBalances)
   * Issue #9 Fix: Correct type annotation (WalletBalance with priority)
   * Issue #10 Fix: Using currency as key instead of index
   * Issue #11 Fix: Memoized rows to prevent unnecessary recalculations
   * Issue #12 Fix: Safe USD value calculation with error handling
   */
  const rows = useMemo(() => {
    return sortedBalances.map((balance) => {
      const usdValue = calculateUsdValue(balance.currency, balance.amount, prices);
      const formattedAmount = formatAmount(balance.amount);

      return (
        <WalletRow
          className={classes.row}
          key={balance.currency} // Issue #10 Fix: Using currency as stable unique key
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={formattedAmount}
        />
      );
    });
  }, [sortedBalances, prices]); // Issue #11 Fix: Properly memoized with correct dependencies

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
