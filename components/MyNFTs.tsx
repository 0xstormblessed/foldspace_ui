// MyNFTs.tsx
import React from 'react';
import ListCards from '../components/ListCards';
import { TokenInfo } from '../utils/types';

interface MyNFTsProps {
    tokensInfo: TokenInfo[] | undefined;
    hasFid: boolean;
    updateTokenCallback: () => void;
}

const MyNFTs: React.FC<MyNFTsProps> = ({
    hasFid,
    tokensInfo,
    updateTokenCallback,
}) => {
    return (
        <>
            {tokensInfo && (
                <ListCards
                    hasFid={hasFid}
                    tokensInfo={tokensInfo}
                    tokenUpdateCallback={updateTokenCallback}
                />
            )}
        </>
    );
};

export default MyNFTs;
