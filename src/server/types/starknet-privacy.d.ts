declare module 'starknet-privacy' {
  import type { Account, constants } from 'starknet';

  export interface PrivateTransfersOptions {
    account: Account;
    viewingKeyProvider: {
      getViewingKey: () => Promise<string | bigint>;
    };
    provingProvider: {
      url: string;
      chainId: constants.StarknetChainId;
    };
    discoveryProvider: {
      url: string;
    };
    poolContractAddress: string;
  }

  export interface TransferCallAndProof {
    call: any;
    proof: {
      proofFacts?: any[];
      data?: any;
    };
  }

  export interface TransferBuilder {
    with: (token: string, callback: (t: any) => any) => TransferBuilder;
    surplusTo: (account: unknown) => TransferBuilder;
    createProofInvocation: (options?: { provingBlockId?: number }) => Promise<any>;
    execute: () => Promise<TransferCallAndProof>;
  }

  export interface PrivateTransfersInterface {
    build: (options?: Record<string, any>) => TransferBuilder;
    executeWithInvocation: (invocation: any, provingBlockId: number) => Promise<{ callAndProof: TransferCallAndProof }>;
  }

  export function createPrivateTransfers(options: PrivateTransfersOptions): PrivateTransfersInterface;
}

declare module 'starknet-privacy/testing' {
  export class NoValidateProofProvider {
    constructor(options?: unknown);
  }
  export class ContractDiscoveryProvider {
    constructor(options?: unknown);
  }
}
