// FoldSpaceCard.tsx
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface FoldSpaceCardProps {
    tokenId: bigint; // Using bigint for tokenId
}

const FoldSpaceCard: React.FC<FoldSpaceCardProps> = ({ tokenId }) => {
    return (
        <Card sx={{ minWidth: 275, margin: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Token ID: {tokenId.toString()} {/* Converting bigint to string for display */}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default FoldSpaceCard;
