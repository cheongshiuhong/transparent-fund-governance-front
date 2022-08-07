// Types
import type { Nullable, Proposal, Vote } from '@interfaces/general';
import type { Event } from 'ethers';

// Libraries
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import addresses from '@constants/addresses';
import contracts from '@constants/contracts';
import { getStartBlock, getBlockExecuted } from '../../utils';

type UseProposalReturn = {
    isLoading: boolean;
    currentBlock: number;
    proposal: Nullable<Proposal>;
    votes: Vote[];
    totalVotingPower: number;
    hasUserVoted: boolean;
    castVote: (direction: number) => Promise<void>;
    isExecutable: boolean;
    execute: () => Promise<void>;
};

/**
 * Custom hook to retrieve the proposal with the voting event logs.
 *
 * @param {string} id - The proposal id to retrieve.
 * @returns {UseProposalReturn} - The proposal details object.
 */
const useProposal = (id: string): UseProposalReturn => {
    const { provider, chainId, userAddress } = useWeb3Context();

    const [isLoading, setIsLoading] = useState<UseProposalReturn['isLoading']>(false);
    const [currentBlock, setCurrentBlock] = useState<UseProposalReturn['currentBlock']>(0);
    const [proposal, setProposal] = useState<UseProposalReturn['proposal']>(null);
    const [votes, setVotes] = useState<UseProposalReturn['votes']>([]);
    const [totalVotingPower, setTotalVotingPower] =
        useState<UseProposalReturn['totalVotingPower']>(0);
    const [isExecutable, setIsExecutable] = useState<UseProposalReturn['isLoading']>(false);

    /** Effect for initial load when provider is ready */
    useEffect(() => {
        const loadInitial = async (): Promise<void> => {
            if (!provider) return;
            const opsGovernorAddress = addresses.opsGovernors[chainId];
            if (!opsGovernorAddress) return;
            const opsGovernorContract = contracts.opsGovernor
                .connect(provider)
                .attach(opsGovernorAddress);

            setIsLoading(true);

            // Read the current block
            const currentBlockResponse = await provider.getBlockNumber();
            setCurrentBlock(currentBlockResponse);

            // Subscribe to new blocks
            provider.addListener('block', setCurrentBlock);

            try {
                // Retrieve the proposal
                const proposalResponse = await opsGovernorContract.getProposal(id);
                const [startBlock, blockExecuted] = await Promise.all([
                    getStartBlock(opsGovernorContract, BigNumber.from(id)),
                    getBlockExecuted(opsGovernorContract, BigNumber.from(id))
                ]);
                const endBlock = proposalResponse.deadline.toNumber();
                const proposal: Proposal = {
                    id,
                    ...proposalResponse,
                    startBlock,
                    endBlock,
                    blockExecuted
                };
                setProposal(proposal);

                // Get the votes for the proposal (batch by 5000 blocks)
                const voteFilter = opsGovernorContract.filters.Vote(id);
                const numBatches =
                    Math.floor((endBlock - startBlock) / 5000) +
                    ((endBlock - startBlock) % 5000 === 0 ? 0 : 1);
                const votesResponse: Event[] = await Array(numBatches)
                    .fill(1)
                    .reduce(
                        async (current, _, index) => [
                            ...(await current),
                            ...(await opsGovernorContract.queryFilter(
                                voteFilter,
                                startBlock + index * 5000,
                                startBlock + (index + 1) * 5000
                            ))
                        ],
                        Promise.resolve([]) as Promise<Event[]>
                    );
                const parsedVotes: Vote[] = [];
                votesResponse.forEach((voteResponse) => {
                    parsedVotes.push({
                        voter: voteResponse.args?.voter as string,
                        direction: voteResponse.args?.direction as number
                    });
                });
                setVotes(parsedVotes);

                // Subscribe to votes
                opsGovernorContract.on(
                    voteFilter,
                    async (
                        _,
                        voter: string,
                        direction: number,
                        votingPower: BigNumber,
                        reason: string
                    ) => {
                        // Update the votes
                        setVotes((votes) =>
                            votes.some((vote) => vote.voter === voter)
                                ? votes
                                : [...votes, { voter, direction, votingPower, reason }]
                        );

                        // Check if executable
                        const isExecutableResponse =
                            await opsGovernorContract.getIsProposalExecutable(id);
                        setIsExecutable(isExecutableResponse);
                    }
                );

                // Subscribe to executions
                opsGovernorContract.on(
                    opsGovernorContract.filters.ProposalExecuted(id),
                    async (_eventArgs, eventDetails) => {
                        setProposal({
                            id,
                            ...(await opsGovernorContract.getProposal(id)),
                            startBlock: proposal.startBlock,
                            endBlock: proposal.endBlock,
                            blockExecuted: BigNumber.from(eventDetails.blockNumber)
                        });
                        setIsExecutable(await opsGovernorContract.getIsProposalExecutable(id));
                    }
                );

                // Get the voting power if past start block
                if (proposal.startBlock <= currentBlockResponse) {
                    // Get num mangers
                    const managers = await opsGovernorContract.getManagers();
                    setTotalVotingPower(managers.length);

                    // Check if executable
                    setIsExecutable(await opsGovernorContract.getIsProposalExecutable(id));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitial();

        return () => {
            provider && provider.removeAllListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, chainId]);

    /**
     * Function to cast a vote.
     *
     * @param {number} direction - The direction of the vote;
     */
    const castVote = async (direction: number): Promise<void> => {
        if (!provider || !proposal) return;
        const opsGovernorAddress = addresses.opsGovernors[chainId];
        if (!opsGovernorAddress) return;
        await contracts.opsGovernor
            .connect(provider.getSigner())
            .attach(opsGovernorAddress)
            .vote(proposal.id, direction);
    };

    /** Function to execute a proposal. */
    const execute = async (): Promise<void> => {
        if (!provider || !proposal) return;
        const opsGovernorAddress = addresses.opsGovernors[chainId];
        if (!opsGovernorAddress) return;
        await contracts.opsGovernor
            .connect(provider.getSigner())
            .attach(opsGovernorAddress)
            .executeProposal(proposal.id);
    };

    return {
        isLoading,
        currentBlock,
        proposal,
        votes,
        totalVotingPower,
        hasUserVoted: votes.some((vote) => vote.voter === userAddress),
        castVote,
        isExecutable,
        execute
    };
};

export default useProposal;
