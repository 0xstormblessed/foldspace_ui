// MintForm.tsx
import React from 'react';
import { Button, Stack, TextField } from '@mui/material';

interface MintFormProps {
    isLoading: boolean;
    isRecipentAddressValid: boolean;
    recipientAddress: string;
    handleAddressChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    submit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const MintForm: React.FC<MintFormProps> = ({
    isLoading,
    isRecipentAddressValid,
    recipientAddress,
    handleAddressChange,
    submit,
}) => {
    return (
        <form onSubmit={submit}>
            <Stack spacing={2} direction="column">
                <TextField
                    label="Recipient Address (Optional)"
                    placeholder="Enter recipient Ethereum address (optional)"
                    variant="outlined"
                    fullWidth
                    value={recipientAddress}
                    onChange={handleAddressChange}
                    error={!isRecipentAddressValid}
                    helperText={
                        !isRecipentAddressValid && 'Invalid Ethereum address'
                    }
                    disabled={isLoading}
                />
                <Button
                    disabled={isLoading || !isRecipentAddressValid}
                    type="submit"
                    color="primary"
                    variant="contained"
                    style={{
                        backgroundColor: isRecipentAddressValid
                            ? undefined
                            : 'red',
                        color: isRecipentAddressValid ? undefined : 'white',
                    }}
                >
                    {isLoading ? 'Confirming...' : 'Mint'}
                </Button>
            </Stack>
        </form>
    );
};

export default MintForm;
