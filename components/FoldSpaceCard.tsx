import React, { useState } from 'react';
import { Address } from 'viem';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useWriteContract, useAccount } from 'wagmi';
import { TokenInfo } from '../utils/types';
import { foldspaceContractConfig } from '../utils/foldspace';

interface FoldSpaceCardProps {
    tokenInfo: TokenInfo;
    tokenUpdateCallback: () => void;
    //onClaim: (tokenId: bigint) => Promise<void>;
}

const FoldSpaceCard: React.FC<FoldSpaceCardProps> = ({
    tokenInfo,
    tokenUpdateCallback,
}) => {
    const { address } = useAccount();
    const { tokenId, FID } = tokenInfo;
    const [isTransferLoading, setIsTransferLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [ethereumAddress, setEthereumAddress] = useState('');

    const {
        data: transferHash,
        isPending: isPendingTransfer,
        error: transferError,
        writeContract,
    } = useWriteContract();

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAddressChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setEthereumAddress(event.target.value);
    };

    const handleTransferClick = async () => {
        setIsTransferLoading(true);
        try {
            if (tokenId === undefined) {
                throw new Error('Token ID is undefined');
            }
            if (ethereumAddress === '') {
                throw new Error('Ethereum address is empty');
            }
            writeContract({
                ...foldspaceContractConfig,
                functionName: 'transferFrom',
                args: [address, ethereumAddress, tokenId],
            });
        } catch (error) {
            console.error('Transfer failed:', error);
        } finally {
            setIsTransferLoading(false);
            handleCloseDialog(); // Close the dialog after the transfer
        }
    };

    return (
        <Card sx={{ minWidth: 275, margin: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Token ID: {tokenId.toString()}
                </Typography>
                <Divider sx={{ my: 1 }} />
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
                        onClick={handleOpenDialog}
                    >
                        Transfer
                    </Button>
                </Box>
            </CardContent>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Transfer Token</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To transfer this token, please enter the receipent
                        address below.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="ethereumAddress"
                        label="recipient..."
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={ethereumAddress}
                        onChange={handleAddressChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTransferClick}
                        variant="contained"
                        color="primary"
                        disabled={isTransferLoading}
                        sx={{ position: 'relative' }}
                    >
                        {isTransferLoading ? (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    mt: '-12px',
                                    ml: '-12px',
                                }}
                            />
                        ) : (
                            'Confirm Transfer'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default FoldSpaceCard;
