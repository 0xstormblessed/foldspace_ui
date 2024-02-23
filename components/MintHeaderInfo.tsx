import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { formatEther } from 'viem';

interface MintHeaderInfoProps {
    fid: bigint;
    balanceOf: bigint;
    price: bigint;
}

const MintHeaderInfo: React.FC<MintHeaderInfoProps> = ({
    fid,
    balanceOf,
    price,
}) => {
    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start', // Align items to the start for a vertical layout
                    p: 1, // Add some padding
                }}
            >
                {fid && fid > 0n ? (
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {`Connected Wallet Registered FID: ${fid}`}
                    </Typography>
                ) : (
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Wallet has no registered FID
                    </Typography>
                )}
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Number of FoldSpace NFTs Owned:{' '}
                    {balanceOf ? balanceOf.toString() : '0'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Price to Mint in ETH:{' '}
                    {price ? formatEther(price) : 'loading price...'}
                </Typography>
            </Box>
        </Container>
    );
};

export default MintHeaderInfo;
