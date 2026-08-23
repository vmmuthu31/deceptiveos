import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { PrivateTreasuryState, TreasuryTx } from '@/shared/types';
import { shieldStrk } from '@/server/services/starknet/shield';
import { privateTransfer } from '@/server/services/starknet/transfer';
import { unshieldStrk } from '@/server/services/starknet/unshield';
import { getStrk20Config } from '@/server/config/strk20';

export async function getPrivateTreasuryState(): Promise<PrivateTreasuryState> {
  const db = readDb();
  if (!db.treasury) {
    const config = getStrk20Config();
    db.treasury = {
      publicWalletAddress: config.accountAddress,
      publicBalanceStrk: 10000,
      shieldedBalanceStrk: 0,
      committedBountyStrk: 0,
      availableShieldedStrk: 0,
      transactions: [],
    };
    writeDb(db);
  }
  return db.treasury;
}

export async function executeTreasuryTransaction(data: {
  type: 'SHIELD' | 'PRIVATE_TRANSFER' | 'UNSHIELD';
  amountStrk: number;
  recipient?: string;
  memo: string;
}): Promise<{ treasury: PrivateTreasuryState; transaction: TreasuryTx }> {
  const db = readDb();
  if (!db.treasury) await getPrivateTreasuryState();

  const treasury = db.treasury!;
  const amount = BigInt(data.amountStrk);

  let txHash: string;
  let utxoCommitment: string;

  if (data.type === 'SHIELD') {
    const result = await shieldStrk(amount);
    txHash = result.txHash;
    utxoCommitment = `0xutxo_${result.blockNumber}`;
    treasury.publicBalanceStrk -= data.amountStrk;
    treasury.shieldedBalanceStrk += data.amountStrk;
    treasury.availableShieldedStrk += data.amountStrk;
  } else if (data.type === 'UNSHIELD') {
    const result = await unshieldStrk(amount, data.recipient);
    txHash = result.txHash;
    utxoCommitment = `0xutxo_${result.blockNumber}`;
    treasury.shieldedBalanceStrk -= data.amountStrk;
    treasury.availableShieldedStrk -= data.amountStrk;
    treasury.publicBalanceStrk += data.amountStrk;
  } else if (data.type === 'PRIVATE_TRANSFER') {
    if (!data.recipient) throw new Error('Recipient required for private transfer');
    const result = await privateTransfer(data.recipient, amount);
    txHash = result.txHash;
    utxoCommitment = `0xutxo_${result.blockNumber}`;
    treasury.availableShieldedStrk -= data.amountStrk;
    treasury.committedBountyStrk += data.amountStrk;
  } else {
    throw new Error(`Unknown transaction type: ${data.type}`);
  }

  const newTx: TreasuryTx = {
    id: `tx-${Date.now().toString(36)}`,
    type: data.type,
    amountStrk: data.amountStrk,
    txHash,
    utxoCommitment,
    status: 'CONFIRMED',
    timestamp: new Date().toISOString(),
    memo: data.memo,
  };

  treasury.transactions.unshift(newTx);
  writeDb(db);

  appendAuditBlock(`STRK20_${data.type}_EXECUTED`, {
    amountStrk: data.amountStrk,
    txHash,
    utxoCommitment,
  });

  return { treasury, transaction: newTx };
}
