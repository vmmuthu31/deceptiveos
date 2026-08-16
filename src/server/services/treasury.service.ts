import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { PrivateTreasuryState, TreasuryTx } from '@/shared/types';
import crypto from 'crypto';

export async function getPrivateTreasuryState(): Promise<PrivateTreasuryState> {
  const db = readDb();
  if (!db.treasury) {
    db.treasury = {
      publicWalletAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
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
  memo: string;
}): Promise<{ treasury: PrivateTreasuryState; transaction: TreasuryTx }> {
  const db = readDb();
  if (!db.treasury) await getPrivateTreasuryState();

  const treasury = db.treasury!;
  const txHash = `0x${crypto.randomBytes(16).toString('hex')}`;
  const utxoCommitment = `0xutxo_${crypto.randomBytes(8).toString('hex')}`;

  if (data.type === 'SHIELD') {
    treasury.publicBalanceStrk -= data.amountStrk;
    treasury.shieldedBalanceStrk += data.amountStrk;
    treasury.availableShieldedStrk += data.amountStrk;
  } else if (data.type === 'UNSHIELD') {
    treasury.shieldedBalanceStrk -= data.amountStrk;
    treasury.availableShieldedStrk -= data.amountStrk;
    treasury.publicBalanceStrk += data.amountStrk;
  } else if (data.type === 'PRIVATE_TRANSFER') {
    treasury.availableShieldedStrk -= data.amountStrk;
    treasury.committedBountyStrk += data.amountStrk;
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
