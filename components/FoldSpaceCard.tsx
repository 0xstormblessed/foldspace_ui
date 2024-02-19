import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { TokenInfo } from '../utils/types';

interface FoldSpaceCardProps {
    tokenInfo: TokenInfo;
}

const FoldSpaceCard: React.FC<FoldSpaceCardProps> = ({ tokenInfo }) => {
    const { tokenId, FID, URI } = tokenInfo; 

    return (
        <Card sx={{ minWidth: 275, margin: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Token ID: {tokenId.toString()}
                </Typography>
                <Typography variant="body1">
                    FID: {FID.toString()} 
                </Typography>
            </CardContent>
        </Card>
    );
};

export default FoldSpaceCard;
