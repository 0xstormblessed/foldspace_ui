import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider'; // Import Divider
import Box from '@mui/material/Box'; // For layout
import { TokenInfo } from '../utils/types';

interface FoldSpaceCardProps {
    tokenInfo: TokenInfo;
    onTransfer: (tokenId: bigint) => Promise<void>;
    onClaim: (tokenId: bigint) => Promise<void>;
}

const FoldSpaceCard: React.FC<FoldSpaceCardProps> = ({
    tokenInfo,
    onTransfer,
    onClaim,
}) => {
    const { tokenId, FID, URI } = tokenInfo;
    const [isTransferLoading, setIsTransferLoading] = useState(false);
    const [isClaimLoading, setIsClaimLoading] = useState(false);

    const handleTransferClick = async () => {
        setIsTransferLoading(true);
        try {
            await onTransfer(tokenId);
        } catch (error) {
            console.error('Transfer failed:', error);
        } finally {
            setIsTransferLoading(false);
        }
    };

    const handleClaimClick = async () => {
        setIsClaimLoading(true);
        try {
            await onClaim(tokenId);
        } catch (error) {
            console.error('Claim failed:', error);
        } finally {
            setIsClaimLoading(false);
        }
    };

    return (
        <Card sx={{ minWidth: 275, margin: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Token ID: {tokenId.toString()}
                </Typography>
                <Divider sx={{ my: 1 }} /> {/* Divider for styling */}
                <Typography
                    variant="body1"
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    FID: <span>{FID.toString()}</span>
                </Typography>
                <Box
                    sx={{
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleTransferClick}
                        disabled={isTransferLoading}
                        startIcon={
                            isTransferLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : null
                        }
                    >
                        {isTransferLoading ? 'Transferring...' : 'Transfer'}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleClaimClick}
                        disabled={isClaimLoading}
                        startIcon={
                            isClaimLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : null
                        }
                    >
                        {isClaimLoading ? 'Claiming...' : 'Claim'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default FoldSpaceCard;
