import { getStarknetAccount, getStarknetProvider, getPrivateTransfers } from './client';
import { STRK_TOKEN_ADDRESS, V3_TX_TIP } from '@/server/config/constants';
import { getStrk20Config } from '@/server/config/strk20';
import { appendAuditBlock } from '@/server/db/database';

const WAIT_OPTIONS = { retryInterval: 2000, timeout: 60000 };

export interface UnshieldResult {
  txHash: string;
  blockNumber: number;
  amount: bigint;
  status: 'CONFIRMED' | 'REVERTED';
}

export async function unshieldStrk(
  amount: bigint,
  recipient?: string,
): Promise<UnshieldResult> {
  if (amount <= 0n) throw new Error('Unshield amount must be positive');

  const config = getStrk20Config();
  const account = getStarknetAccount();
  const provider = getStarknetProvider();
  const transfers = getPrivateTransfers();
  const withdrawRecipient = recipient ?? config.accountAddress;

  const currentBlock = await provider.getBlockNumber();
  const provingBlockId = currentBlock - 10;

  const builder = transfers
    .build({
      autoRegister: true,
      autoSetup: true,
      autoDiscover: { notes: 'refresh', channels: 'refresh' },
      autoSelectNotes: 'naive',
    })
    .surplusTo(config.accountAddress)
    .with(STRK_TOKEN_ADDRESS, (t) =>
      t.withdraw({ amount, recipient: withdrawRecipient }),
    );

  const invocation = await builder.createProofInvocation({ provingBlockId });
  const { callAndProof } = await transfers.executeWithInvocation(
    invocation,
    provingBlockId,
  );

  const proofDetails =
    callAndProof.proof.proofFacts?.length
      ? {
          proofFacts: callAndProof.proof.proofFacts,
          proof: callAndProof.proof.data,
        }
      : {};

  const executeTx = await account.execute(callAndProof.call, {
    tip: V3_TX_TIP,
    ...proofDetails,
  });

  const receipt = await provider.waitForTransaction(
    executeTx.transaction_hash,
    WAIT_OPTIONS,
  );

  const status = receipt.isSuccess() ? 'CONFIRMED' : 'REVERTED';

  if (!receipt.isSuccess()) {
    throw new Error(`Unshield transaction reverted: ${JSON.stringify(receipt)}`);
  }

  appendAuditBlock('STRK20_UNSHIELD_EXECUTED', {
    amount: amount.toString(),
    txHash: executeTx.transaction_hash,
    blockNumber: receipt.block_number,
  });

  return {
    txHash: executeTx.transaction_hash,
    blockNumber: receipt.block_number,
    amount,
    status,
  };
}
