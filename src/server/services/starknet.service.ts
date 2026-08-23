import { appendAuditBlock, readDb } from '@/server/db/database';
import { getStrk20Config } from '@/server/config/strk20';
import crypto from 'crypto';

export interface ShieldedUtxoCanary {
  commitment: string;
  contractAddress: string;
  network: string;
  protocol: string;
  tokenType: string;
  createdAt: string;
}

export interface Strk20SdkConfig {
  sdkPackage: string;
  factoryMethod: string;
  poolContractAddress: string;
  viewingKeyProvider: {
    type: string;
    keyType: string;
  };
  provingProvider: {
    type: string;
    circuitVersion: string;
  };
  discoveryProvider: {
    type: string;
    indexerUrl: string;
  };
  submissionRules: {
    provingBlockIdOffset: number;
    v3TransactionTip: string;
  };
}

export async function getStarknetDeceptionStatus() {
  const db = readDb();
  const config = getStrk20Config();
  const lureCount = db.lures ? db.lures.length : 0;
  const bountyCount = db.ghostBounties ? db.ghostBounties.length : 0;
  const auditHeight = db.auditLedger ? db.auditLedger.length : 0;

  return {
    network: config.chainId === '0x534e5f4d41494e' ? 'Starknet Mainnet' : 'Starknet Sepolia',
    contractAddress: config.poolAddress,
    shieldedPoolProtocol: 'STRK20 Zero-Knowledge Privacy Pool',
    activeUtxoCanariesCount: lureCount + bountyCount,
    ledgerProofHeight: auditHeight,
    lastProofSubmittedAt: db.auditLedger[db.auditLedger.length - 1]?.timestamp || new Date().toISOString(),
    status: 'ACTIVE_SHIELDED',
    sdkConfig: {
      sdkPackage: '@starkware-libs/starknet-privacy-sdk',
      factoryMethod: 'createPrivateTransfers',
      poolContractAddress: config.poolAddress,
      viewingKeyProvider: {
        type: 'ViewingKeyProvider',
        keyType: 'BigInt (k)',
      },
      provingProvider: {
        type: 'ProvingServiceProofProvider',
        circuitVersion: 'Cairo v3 STARK',
      },
      discoveryProvider: {
        type: 'IndexerDiscoveryProvider',
        indexerUrl: config.indexerUrl,
      },
      submissionRules: {
        provingBlockIdOffset: 10,
        v3TransactionTip: 'tip: 0n',
      },
    },
  };
}

export function generateShieldedUtxoCanary(watermarkToken: string): ShieldedUtxoCanary {
  const config = getStrk20Config();
  const commitment = `0x${watermarkToken}${crypto.randomBytes(8).toString('hex')}`;

  appendAuditBlock('STRK20_SHIELDED_UTXO_GENERATED', {
    commitment,
    contract: config.poolAddress,
    token: watermarkToken,
  });

  return {
    commitment,
    contractAddress: config.poolAddress,
    network: config.chainId === '0x534e5f4d41494e' ? 'Starknet Mainnet' : 'Starknet Sepolia',
    protocol: 'STRK20 Privacy Pool',
    tokenType: 'STRK20 Shielded UTXO Secret',
    createdAt: new Date().toISOString(),
  };
}
