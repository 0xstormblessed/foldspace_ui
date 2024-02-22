import React, { useState } from 'react';
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
import {
    useWriteContract,
    useAccount,
    useWalletClient,
    useWaitForTransactionReceipt,
} from 'wagmi';
import { verifyTypedData } from 'viem';
import TrxStatusModal from '../components/TrxStatusModal';
import { TokenInfo } from '../utils/types';
import { foldspaceContractConfig, signTransfer } from '../utils/foldspace';
import {
    IdRegistryTransferMessage,
    ID_REGISTRY_EIP_712_TYPES,
} from '../utils/farcaster';

interface FoldSpaceCardProps {
    tokenInfo: TokenInfo;
    hasFid: boolean;
    tokenUpdateCallback: () => void;
}

const FoldSpaceCard: React.FC<FoldSpaceCardProps> = ({
    tokenInfo,
    hasFid,
    tokenUpdateCallback,
}) => {
    const { address } = useAccount();
    const {
        data: walletClient,
        isError,
        isLoading: isLoadingWallet,
    } = useWalletClient();
    const { tokenId, FID, claimed } = tokenInfo;
    const [isTransferLoading, setIsTransferLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [ethereumAddress, setEthereumAddress] = useState('');
    const [isClaimLoading, setIsClaimLoading] = useState(false);
    const [isOpenTrxStatusModalTransfer, setIsOpenTrxStatusModalTransfer] =
        useState(false);
    const [isOpenTrxStatusModalClaim, setIsOpenTrxStatusModalClaim] =
        useState(false);

    const {
        data: hashForTransfer,
        isPending: isPendingTransactionTransfer,
        error: tranferError,

        writeContract: writeContractForTransfer,
    } = useWriteContract();

    const {
        data: hashForClaim,
        isPending: isPendingTransactionClaim,
        error: claimError,
        writeContract: writeContractForClaim,
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
            writeContractForTransfer({
                ...foldspaceContractConfig,
                functionName: 'transferFrom',
                args: [address, ethereumAddress, tokenId],
            });
            setIsOpenTrxStatusModalTransfer(true);
        } catch (error) {
            console.error('Transfer failed:', error);
        } finally {
            setIsTransferLoading(false);
            handleCloseDialog(); // Close the dialog after the transfer
        }
    };

    const handleClaimClick = async () => {
        setIsClaimLoading(true);
        try {
            if (address === undefined) {
                throw new Error('Address is undefined');
            }
            if (walletClient === undefined) {
                throw new Error('Wallet client is undefined');
            }
            const deadline = BigInt(Math.floor(Date.now() / 1000));

            let message: IdRegistryTransferMessage = {
                fid: FID,
                to: address,
                nonce: 0n,
                deadline,
            };
            console.log('Signing message');
            const signatureResult = await signTransfer(walletClient, message);
            if (signatureResult.isErr()) {
                throw new Error(signatureResult?.error?.message);
            }

            console.log('Signing result');

            const signature = signatureResult._unsafeUnwrap();
            const verified = await verifyTypedData({
                address,
                ...ID_REGISTRY_EIP_712_TYPES,
                primaryType: 'Transfer',
                message,
                signature,
            });

            console.log('verifyfing..');

            if (!verified) {
                throw new Error('Signature verification failed');
            }

            console.log('verified');

            writeContractForClaim({
                ...foldspaceContractConfig,
                functionName: 'claimFid',
                args: [tokenId, deadline, signature],
            });

            console.log('writing contract to claim FID');
            setIsOpenTrxStatusModalClaim(true);
        } catch (error) {
            console.error('Claim error:', error); // Handle error
        } finally {
            setIsClaimLoading(false);
        }
    };

    const handleTrxStatusModalTransferClose = () => {
        setIsOpenTrxStatusModalTransfer(false); // Close the transfer modal
        tokenUpdateCallback();
    };

    const handleTrxStatusModalClaimClose = () => {
        setIsOpenTrxStatusModalClaim(false); // Close the claim modal
    };

    const disableClaim =
        hasFid || claimed || isClaimLoading || isPendingTransactionClaim;
    const disableTransfer = isTransferLoading || isPendingTransactionTransfer;

    return (
        <Card sx={{ minWidth: 275, margin: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Token ID: {tokenId?.toString()}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography
                    variant="body1"
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    FID: {FID?.toString()}
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
                        color="secondary"
                        onClick={handleOpenDialog}
                        disabled={disableTransfer}
                        sx={{ position: 'relative' }}
                    >
                        {disableTransfer ? (
                            <>
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: 'white', // Assuming you want the spinner to be white for better visibility on a secondary button
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px', // Half of size to vertically center
                                        marginLeft: '-12px', // Half of size to horizontally center
                                    }}
                                />
                                Loading...{' '}
                            </>
                        ) : (
                            'Transfer'
                        )}
                    </Button>
                </Box>
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
                        onClick={handleClaimClick}
                        disabled={disableClaim}
                        sx={{ position: 'relative' }}
                    >
                        {disableClaim ? (
                            <>
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: 'white', // Assuming you want the spinner to be white to contrast with a primary colored button
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px', // Half of size to center vertically
                                        marginLeft: '-12px', // Half of size to center horizontally
                                    }}
                                />
                                Claiming...{' '}
                            </>
                        ) : hasFid || claimed ? (
                            'Cannot Claim Fid'
                        ) : (
                            'Sign and Claim'
                        )}
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
            {hashForTransfer && (
                <TrxStatusModal
                    isOpen={isOpenTrxStatusModalTransfer}
                    onClose={handleTrxStatusModalTransferClose}
                    callback={tokenUpdateCallback}
                    hash={hashForTransfer}
                    confirmingText="Confirming transfer transaction..."
                    confirmedText="Transfer Transaction confirmed!"
                />
            )}
            {hashForClaim && (
                <TrxStatusModal
                    isOpen={isOpenTrxStatusModalClaim}
                    onClose={handleTrxStatusModalClaimClose}
                    hash={hashForClaim}
                    confirmingText="Confirming claim transaction..."
                    confirmedText="Claim Transaction confirmed!"
                />
            )}
        </Card>
    );
};

export default FoldSpaceCard;
