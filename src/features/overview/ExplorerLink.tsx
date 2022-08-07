// Types
import type { FC, ReactElement } from 'react';

// Context
import { useWeb3Context } from '@contexts/web3';

// Code
import explorers from '@constants/explorers';

type ExplorerLinkProps = {
    address: string;
};

/**
 * The explorer link component.
 *
 * @param {ExplorerLinkProps} props - The address of the contract to link to.
 * @returns {ReactElement} - The explorer link component.
 */
const ExplorerLink: FC<ExplorerLinkProps> = ({ address }: ExplorerLinkProps): ReactElement => {
    const { chainId } = useWeb3Context();

    if (!explorers[chainId]) {
        return <span>{address}</span>;
    }

    return (
        <span className="underline text-blue-800">
            <a href={`${explorers[chainId]}${address}`} target="_blank" rel="noopener noreferrer">
                {address}
            </a>
        </span>
    );
};

export default ExplorerLink;
