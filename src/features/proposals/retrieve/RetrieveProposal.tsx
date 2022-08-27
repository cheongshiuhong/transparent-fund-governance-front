// Types
import type { FC, ReactElement } from 'react';

// Libraries
import Error from 'next/error';

// Contexts
import { useWeb3Context } from '@contexts/web3';

// Code
import useRouter from '@hooks/useRouter';
import StatusBadge from '@components/proposals/StatusBadge';
import { decodeAbi } from '@utils/abis';
import useProposal from './hooks/useProposal';
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';
import Execution from './Execution';
import Voting from './Voting';
import Argument from './Argument';

/**
 * The retrieve proposal component.
 *
 * @returns {ReactElement} - The retrieve proposal copmponent.
 */
const RetrieveProposal: FC = (): ReactElement => {
    const { userAddress } = useWeb3Context();
    const { query } = useRouter();
    const {
        isLoading,
        currentBlock,
        proposal,
        votes,
        totalVotingPower,
        hasUserVoted,
        castVote,
        isExecutable,
        execute
    } = useProposal(query.id as string);

    if (!isLoading && !proposal)
        return (
            <div className="h-auto w-full">
                <Error statusCode={404} title="Proposal could not be found" />;
            </div>
        );

    if (!proposal) {
        return <></>;
    }

    const { functionName, inputs, decodedCallData } = decodeAbi(proposal.callData);

    return (
        <div className="w-full max-w-[980px] mx-auto space-y-3">
            {/* Execution */}
            {/* {isExecutable && <Execution execute={execute} />} */}
            <Execution execute={execute} />
            {/* Voting */}
            {/* {!hasUserVoted &&
                proposal.startBlock.lte(currentBlock) &&
                proposal.endBlock.gte(currentBlock) && (
                    <Voting castVote={castVote} totalVotingPower={totalVotingPower} />
                )} */}
            <Voting castVote={castVote} totalVotingPower={totalVotingPower} />
            {/* Basic details */}
            <div className="w-full px-3 py-2 overflow-x-auto bg-white shadow-md">
                <p className="text-xs sm:text-sm md:text-base">
                    <span className="font-semibold">Proposal ID</span>:&nbsp;
                    {proposal.id.toString()}
                </p>
                <p className="text-xs sm:text-sm md:text-base">
                    <span className="font-semibold">Proposer</span>:&nbsp;{proposal.proposer}
                </p>
                <p className="text-xs sm:text-sm md:text-base">
                    <span className="font-semibold">Description</span>:&nbsp;{proposal.description}
                </p>
                <p className="text-xs sm:text-sm md:text-base">
                    <span className="font-semibold">Block Duration</span>:&nbsp;
                    {proposal.startBlock.toString()}
                    &nbsp;-&nbsp;{proposal.endBlock.toString()}
                    &nbsp;(Current: {currentBlock})
                </p>
                <p className="text-xs sm:text-sm md:text-base">
                    <span className="font-semibold">Status</span>:&nbsp;
                    <StatusBadge
                        statusCode={proposal.status}
                        blockExecuted={proposal.blockExecuted.toString()}
                    />
                </p>
            </div>
            {/* Votes */}
            <div className="w-full px-3 py-3 bg-white shadow-md">
                <p>
                    <span className="font-semibold">Total Voting Power</span>:&nbsp;
                    {totalVotingPower === 0 ? <>Snapshot not taken yet.</> : totalVotingPower}
                </p>
                <p>
                    <span className="font-semibold">Votes For</span>:&nbsp;
                    {totalVotingPower === 0 ? (
                        <>Snapshot not taken yet.</>
                    ) : (
                        <>
                            {proposal.votesFor.toString()}
                            &nbsp;(
                            {bigNumberToDecimalString(
                                proposal.votesFor.mul(10_000).div(totalVotingPower),
                                2,
                                2
                            )}
                            %)
                        </>
                    )}
                </p>
                <p>
                    <span className="font-semibold">Votes Against</span>:&nbsp;
                    {totalVotingPower === 0 ? (
                        <>Snapshot not taken yet.</>
                    ) : (
                        <>
                            {proposal.votesAgainst.toString()}
                            &nbsp;(
                            {bigNumberToDecimalString(
                                proposal.votesAgainst.mul(10_000).div(totalVotingPower),
                                2,
                                2
                            )}
                            %)
                        </>
                    )}
                </p>
                <div className="mt-1 max-h-[420px] space-y-2 overflow-x-auto">
                    {votes.map((vote) => (
                        <div
                            key={vote.voter}
                            className={`w-full text-wrap mt-2 px-2 py-1
                                ${
                                    vote.voter === userAddress
                                        ? vote.direction === 0
                                            ? 'bg-green-300'
                                            : 'bg-red-300'
                                        : 'bg-translucent-light-gray'
                                }`}>
                            <p className="text-xs sm:text-sm md:text-base">
                                <span className="font-semibold">Voter</span>:&nbsp;{vote.voter}
                                {vote.voter === userAddress && <>&nbsp;(me)</>}
                            </p>
                            <p className="text-xs sm:text-sm md:text-base">
                                <span className="font-semibold">Direction</span>:&nbsp;
                                {vote.direction === 0 ? 'FOR' : 'AGAINST'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Function calls */}
            <div className="w-full px-3 py-2 bg-white shadow-md">
                <p className="font-semibold">Function Call:</p>
                <div className="mt-1 max-h-[480px] overflow-y-auto">
                    <div className="w-full text-wrap mt-2 px-2 py-1 bg-translucent-light-gray">
                        <p className="text-xs sm:text-sm md:text-base">
                            <span className="font-semibold">Function Name</span>:&nbsp;
                            {functionName}
                        </p>
                        <div className="text-xs sm:text-sm md:text-base">
                            <span className="font-semibold">Arguments</span>:&nbsp;
                            {inputs.map((input, index) => (
                                <p key={index}>
                                    <span className="underline">{input.name}</span>
                                    <span>
                                        :&nbsp;
                                        <Argument
                                            type={input.type}
                                            value={decodedCallData[index]}
                                        />
                                    </span>
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetrieveProposal;
