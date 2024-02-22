import React from 'react';
import Link from '@mui/material/Link';
import { Container } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const FOLDSPACE_CONTRACT = process.env.NEXT_PUBLIC_FOLDSPACE_ADDRESS;

const Footer = () => {
    return (
        <footer
            style={{
                marginTop: 'auto',
                padding: '20px 0',
            }}
        >
            <Container
                maxWidth="lg"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                }}
            >
                <Link
                    href="https://github.com/0xstormblessed/foldspace"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <svg
                        height="24"
                        width="24"
                        viewBox="0 0 16 16"
                        fill="#000000"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.86 2.33.66.07-.52.28-.86.51-1.06-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                        />
                    </svg>
                </Link>
                <Link
                    href={`https://optimistic.etherscan.io/address/${FOLDSPACE_CONTRACT}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    Etherscan
                    <OpenInNewIcon
                        sx={{ ml: 0.5, width: '0.75em', height: '0.75em' }}
                    />
                </Link>
            </Container>
        </footer>
    );
};

export default Footer;
