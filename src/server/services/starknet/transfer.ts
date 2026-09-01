import { getStarknetAccount, getStarknetProvider, getPrivateTransfers } from './client';
import { STRK_TOKEN_ADDRESS, V3_TX_TIP } from '@/server/config/constants';
import { getStrk20Config } from '@/server/config/strk20';
import { appendAuditBlock } from '@/server/db/database';

const WAIT_OPTIONS = { retryInterval: 2000, timeout: 60000 };

export interface PrivateTransferResult {
  txHash: string;
  blockNumber: number;
  recipient: string;
  amount: bigint;
  status: 'CONFIRMED' | 'REVERTED';
}

export async function privateTransfer(
  recipient: string,
  amount: bigint,
): Promise<PrivateTransferResult> {
  if (amount <= 0n) throw new Error('Transfer amount must be positive');
  if (!recipient.match(/^0x[0-9a-fA-F]+$/)) {
    throw new Error('Invalid recipient address');
  }

  const config = getStrk20Config();
  const account = getStarknetAccount();
  const provider = getStarknetProvider();
  const transfers = getPrivateTransfers();

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
    .with(STRK_TOKEN_ADDRESS, (t: any) =>
      t.transfer({ recipient, amount }),
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
    throw new Error(`Private transfer reverted: ${JSON.stringify(receipt)}`);
  }

  appendAuditBlock('STRK20_PRIVATE_TRANSFER_EXECUTED', {
    recipient,
    amount: amount.toString(),
    txHash: executeTx.transaction_hash,
    blockNumber: receipt.block_number,
  });

  return {
    txHash: executeTx.transaction_hash,
    blockNumber: receipt.block_number,
    recipient,
    amount,
    status,
  };
}
