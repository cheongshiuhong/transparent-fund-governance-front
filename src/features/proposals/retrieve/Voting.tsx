// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { useState } from 'react';

type VotingProps = {
    castVote: (direction: number) => Promise<void>;
    totalVotingPower: number;
};

/**
 * The voting component.
 *
 * @param {VotingProps} props - The vote function.
 * @returns {ReactElement} - The voting component.
 */
const Voting: FC<VotingProps> = ({ castVote, totalVotingPower }: VotingProps): ReactElement => {
    const [error, setError] = useState<string>('');

    const submitVote = async (direction: number) => {
        try {
            await castVote(direction);
        } catch (err) {
            if (err.code === 4001) return;
            setError(`Error: unexpected error. ${err.data?.message || err.message}`);
        }
    };

    return (
        <div className="w-full px-3 py-3 space-y-4 overflow-x-auto bg-white shadow-md">
            <p className="text-base lg:text-lg font-semibold">Cast My Vote</p>
            <div className="w-full flex items-center justify-between">
                <p>
                    <span className="font-semibold">My&nbsp;Voting&nbsp;Power</span>:&nbsp;
                    {totalVotingPower === 0 ? (
                        <>Snapshot not taken yet.</>
                    ) : (
                        <>
                            {1}&nbsp;/&nbsp;
                            {totalVotingPower}
                            &nbsp;(
                            {Math.floor((1 / totalVotingPower) * 10000) / 100}
                            %)
                        </>
                    )}
                </p>
                <div className="w-full flex items-center justify-end space-x-3">
                    <button
                        onClick={() => submitVote(0)}
                        className="px-3 py-2 bg-green-600 text-white rounded-md">
                        Vote For
                    </button>
                    <button
                        onClick={() => submitVote(1)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md">
                        Vote Against
                    </button>
                </div>
            </div>
            <p className="text-red-500 italic">{error}</p>
        </div>
    );
};

export default Voting;
