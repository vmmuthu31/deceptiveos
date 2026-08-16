import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { PrivateTreasuryState, TreasuryTx } from '@/shared/types';

export async function getPrivateTreasuryState(): Promise<PrivateTreasuryState> {
  const db = readDb();
  if (!db.treasury) {
    db.treasury = {
      publicWalletAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      publicBalanceStrk: 10000,
      shieldedBalanceStrk: 2450,
      committedBountyStrk: 650,
      availableShieldedStrk: 1800,
      transactions: [
        {
          id: 'tx-01',
          type: 'SHIELD',
          amountStrk: 500,
          txHash: '0x01a89c918239f10293a8e10293b471',
          utxoCommitment: '0xutxo_commitment_998877665544',
          status: 'CONFIRMED',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          memo: 'Shield public STRK into STRK20 Privacy Pool',
        },
        {
          id: 'tx-02',
          type: 'PRIVATE_TRANSFER',
          amountStrk: 250,
          txHash: '0x02b91d948192a01928471a09218471',
          utxoCommitment: '0xutxo_commitment_112233445566',
          status: 'CONFIRMED',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          memo: 'Fund GhostBounty #gb-02 (Attacker DNA 8A:42:F1:9C)',
        },
      ],
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

  const treasury = db.treasury;
  const txHash = `0x${Math.random().toString(16).substring(2, 34)}`;
  const utxoCommitment = `0xutxo_${Math.random().toString(16).substring(2, 14)}`;

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
