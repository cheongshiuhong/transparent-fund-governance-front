// Types
import type { Contract } from 'ethers';
import type { BigNumber } from '@ethersproject/bignumber';

/**
 * Gets the block the proposal was created.
 *
 * @param {Contract} opsGovernorContract - The connected and attached contract.
 * @param {BigNumber} id - The proposal id to get for.
 */
export const getStartBlock = async (
    opsGovernorContract: Contract,
    id: BigNumber
): Promise<number> => {
    const createdFilter = opsGovernorContract.filters.ProposalCreated(id);
    const proposalCreatedResponse = await opsGovernorContract.queryFilter(createdFilter);
    return proposalCreatedResponse[0].blockNumber;
};

/**
 * Gets the block the proposal was executed.
 *
 * @param {Contract} opsGovernorContract - The connected and attached contract.
 * @param {BigNumber} id - The proposal id to get for.
 */
export const getBlockExecuted = async (
    opsGovernorContract: Contract,
    id: BigNumber
): Promise<number> => {
    // Retrieve the block this proposal was executed
    const executedFilter = opsGovernorContract.filters.ProposalExecuted(id);
    const proposalExecutedResponse = await opsGovernorContract.queryFilter(executedFilter);
    return proposalExecutedResponse.length ? proposalExecutedResponse[0].blockNumber : 0;
};
