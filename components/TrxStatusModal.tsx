import React from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    CircularProgress,
    Link,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useWaitForTransactionReceipt } from 'wagmi';
import EtherscanLink from './EtherscanLink';

interface TransactionStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    hash: string;
    callback?: () => void;
    confirmingText?: string;
    confirmedText?: string;
    network?: 'mainnet' | 'rinkeby' | 'ropsten' | 'kovan' | 'goerli'; // Add other networks as needed
}

const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({
    onClose,
    isOpen,
    hash,
    callback,
    confirmingText = 'Confirming transaction...', // Default value if not provided
    confirmedText = 'Transaction confirmed!', // Default value if not provided
}) => {
    if (!hash) {
        return null;
    }

    const trxHash = hash as `0x${string}`;

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash: trxHash });

    if (isConfirmed && callback) {
        callback();
    }

    // Construct the Etherscan URL based on the network
    const etherscanBaseUrl = 'https://optimistic.etherscan.io/tx/';

    const etherscanUrl = `${etherscanBaseUrl}${hash}`;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="transaction-status-modal"
            aria-describedby="displays-ethereum-transaction-status"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    backgroundColor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    width: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                {isConfirming && (
                    <>
                        <CircularProgress />
                        <Typography variant="body1">
                            {confirmingText}
                        </Typography>
                        <EtherscanLink
                            transactionHash={hash}
                            network="optimism"
                        />
                    </>
                )}
                {isConfirmed && (
                    <>
                        <CheckCircleOutlineIcon
                            color="success"
                            sx={{ fontSize: 40 }}
                        />
                        <Typography variant="body1">{confirmedText}</Typography>
                        <EtherscanLink
                            transactionHash={hash}
                            network="optimism"
                        />
                    </>
                )}
                <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default TransactionStatusModal;
