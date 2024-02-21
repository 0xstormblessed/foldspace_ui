// MyNFTs.tsx
import React from 'react';
import ListCards from '../components/ListCards';
import { TokenInfo } from '../utils/types';

interface MyNFTsProps {
    tokensInfo: TokenInfo[] | undefined;
    updateTokenCallback: () => void;
}

const MyNFTs: React.FC<MyNFTsProps> = ({ tokensInfo, updateTokenCallback }) => {
    return (
        <>
            {tokensInfo && (
                <ListCards
                    tokensInfo={tokensInfo}
                    tokenUpdateCallback={updateTokenCallback}
                />
            )}
        </>
    );
};

export default MyNFTs;
