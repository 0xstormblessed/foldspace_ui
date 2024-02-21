export type IdRegistryTransferMessage = {
    /** FID to transfer */
    fid: bigint;

    /** Transfer recipient address */
    to: `0x${string}`;

    /** IdRegistry nonce for signer address */
    nonce: bigint;

    /** Unix timestamp when this message expires */
    deadline: bigint;
};

export const ID_REGISTRY_ADDRESS =
    '0x00000000Fc6c5F01Fc30151999387Bb99A9f489b' as const;

export const ID_REGISTRY_EIP_712_DOMAIN = {
    name: 'Farcaster IdRegistry',
    version: '1',
    chainId: 10,
    verifyingContract: ID_REGISTRY_ADDRESS,
} as const;

export const ID_REGISTRY_TRANSFER_TYPE = [
    { name: 'fid', type: 'uint256' },
    { name: 'to', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
] as const;

export const ID_REGISTRY_EIP_712_TYPES = {
    domain: ID_REGISTRY_EIP_712_DOMAIN,
    types: {
        Transfer: ID_REGISTRY_TRANSFER_TYPE,
    },
} as const;
