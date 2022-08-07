// Types
import type { Proposal } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import addresses from '@constants/addresses';
import contracts from '@constants/contracts';
import { getStartBlock, getBlockExecuted } from '../../utils';

type UseListActiveProposalsReturn = {
    activeProposals: Proposal[];
};

/**
 * Custom hook to list the active proposals.
 *
 * @returns {UseListActiveProposalsReturn} - The proposals details object.
 */
const useListActiveProposals = (): UseListActiveProposalsReturn => {
    const { provider, chainId } = useWeb3Context();

    const [activeProposals, setActiveProposals] = useState<Proposal[]>([]);

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!provider) return;
            const opsGovernorAddress = addresses.opsGovernors[chainId];

            if (!opsGovernorAddress) return;

            // Fetch the current active proposals
            const opsGovernorContract = contracts.opsGovernor
                .connect(provider)
                .attach(opsGovernorAddress);
            const activeProposalsIdsResponse: BigNumber[] =
                await opsGovernorContract.getActiveProposalsIds();
            const activeProposalsResponse = await Promise.all(
                activeProposalsIdsResponse.map(async (id) => {
                    const [activeProposalResponse, startBlock, blockExecuted] = await Promise.all([
                        opsGovernorContract.getProposal(id),
                        getStartBlock(opsGovernorContract, id),
                        getBlockExecuted(opsGovernorContract, id)
                    ]);
                    const endBlock = activeProposalResponse.deadline.toNumber();
                    return { id, ...activeProposalResponse, startBlock, endBlock, blockExecuted };
                })
            );
            setActiveProposals(activeProposalsResponse.reverse());

            // Listen to any new proposals created
            opsGovernorContract.on(
                opsGovernorContract.filters.ProposalCreated(),
                async (id: BigNumber) => {
                    const newProposalResponse = await opsGovernorContract.getProposal(id);

                    const endBlock = newProposalResponse.deadline.toNumber();
                    const [startBlock, blockExecuted] = await Promise.all([
                        getStartBlock(opsGovernorContract, id),
                        getBlockExecuted(opsGovernorContract, id)
                    ]);

                    setActiveProposals((activeProposals) =>
                        // Only set if new proposal is pending and not already shown
                        newProposalResponse.status !== 0 ||
                        activeProposals.some((proposal) => proposal.id.eq(id))
                            ? activeProposals
                            : [
                                  {
                                      id,
                                      ...newProposalResponse,
                                      startBlock,
                                      endBlock,
                                      blockExecuted
                                  },
                                  ...activeProposals
                              ]
                    );
                }
            );
        };

        loadInitial();

        return () => {
            provider && provider.removeAllListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, chainId]);

    return { activeProposals };
};

export default useListActiveProposals;
