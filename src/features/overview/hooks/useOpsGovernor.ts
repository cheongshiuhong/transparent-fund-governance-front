// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import addresses from '@constants/addresses';
import contracts from '@constants/contracts';

type UseOpsGovernorReturn = {
    managers: string[];
    operators: string[];
    tokens: string[];
    protocols: string[];
    utils: string[];
};

/** Constants */
const BATCH_SIZE = 10;

/**
 * Custom hook to retrieve details about the ops governor contract.
 *
 * @returns {UseOpsGovernorReturn} - The ops governor deatils.
 */
const useOpsGovernor = (): UseOpsGovernorReturn => {
    const { provider, chainId } = useWeb3Context();

    const [managers, setManagers] = useState<UseOpsGovernorReturn['managers']>([]);
    const [operators, setOperators] = useState<UseOpsGovernorReturn['operators']>([]);
    const [tokens, setTokens] = useState<UseOpsGovernorReturn['tokens']>([]);
    const [protocols, setProtocols] = useState<UseOpsGovernorReturn['protocols']>([]);
    const [utils, setUtils] = useState<UseOpsGovernorReturn['utils']>([]);

    const paginateAndLoadAll = async (
        func: (offset: number, limit: number) => Promise<string[]>,
        totalCount: BigNumber
    ) =>
        Array(
            totalCount
                .div(BATCH_SIZE)
                .add(totalCount.mod(BATCH_SIZE).eq(0) ? 0 : 1)
                .toNumber()
        )
            .fill(0)
            .reduce(
                async (current, _, index) => [
                    ...(await current),
                    ...(await func(BATCH_SIZE * index, BATCH_SIZE * (index + 1)))
                ],
                Promise.resolve([] as string[]) as Promise<string[]>
            );

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async () => {
            if (!provider) return;
            const opsGovernorAddress = addresses.opsGovernors[chainId];
            if (!opsGovernorAddress) return;

            const opsGovernorContract = contracts.opsGovernor
                .attach(opsGovernorAddress)
                .connect(provider);

            const [numTokens, numProtocols, numUtils] = await Promise.all([
                opsGovernorContract.getNumRegisteredTokens(),
                opsGovernorContract.getNumRegisteredProtocols(),
                opsGovernorContract.getNumRegisteredUtils()
            ]);

            const [managers, operators, tokens, protocols, utils] = await Promise.all([
                opsGovernorContract.getManagers(),
                opsGovernorContract.getOperators(),
                paginateAndLoadAll(opsGovernorContract.getRegisteredTokens, numTokens),
                paginateAndLoadAll(opsGovernorContract.getRegisteredProtocols, numProtocols),
                paginateAndLoadAll(opsGovernorContract.getRegisteredUtils, numUtils)
            ]);

            setManagers(managers);
            setOperators(operators);
            setTokens(tokens);
            setProtocols(protocols);
            setUtils(utils);
        };

        loadInitial();
    }, [provider, chainId]);

    return { managers, operators, tokens, protocols, utils };
};

export default useOpsGovernor;
