// Types
import type { FC, ReactElement, MouseEvent } from 'react';
import type { Nullable } from '@interfaces/general';

// Libraries
import { useState } from 'react';

// Code
import { useWeb3Context } from '@contexts/web3';
import useRouter from '@hooks/useRouter';
import addresses from '@constants/addresses';
import contracts from '@constants/contracts';
// import useFunds from './hooks/useFunds';
import CreateProposalCall from './CreateProposalCall';

const MIN_BLOCKS_DURATION = 1200;

/**
 * The create proposal component.
 *
 * @returns {ReactElement} - The component to create a proposal.
 */
const CreateProposal: FC = (): ReactElement => {
    const { provider, chainId } = useWeb3Context();
    const { redirect } = useRouter();
    // const { addressesOptions } = useFunds();
    const [description, setDescription] = useState<string>('');
    const [blocksDuration, setBlocksDuration] = useState<number>(MIN_BLOCKS_DURATION);
    const [encodedCallData, setEncodedCallData] = useState<Nullable<string>>(null);
    const [error, setError] = useState<string>('');

    /**
     * Submits the creation of the proposal to the chain.
     *
     * @param {MouseEvent<HTMLButtonElement>} e - The click event.
     */
    const onSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError('');

        // Check that all are filled in
        if (encodedCallData === null) {
            setError(`Error: Proposal Function Call is incomplete/invalid.`);
            return;
        }

        // Check for provider
        if (!provider) {
            setError('Error: Provider not initialized');
            return;
        }

        const opsGovernorAddress = addresses.opsGovernors[chainId];
        if (!opsGovernorAddress) {
            setError('Contract not found on the current chain.');
            return;
        }

        try {
            await contracts.opsGovernor
                .attach(opsGovernorAddress)
                .connect(provider.getSigner())
                .functions.createProposal(description, blocksDuration, encodedCallData);

            redirect(`/proposals`);
        } catch (err) {
            if (err.code === 4001) return;
            setError(`Error: unexpected error. ${err.data?.message || err.message}`);
        }
    };

    // Return blank if adresses options not fetched yet
    // if (!addressesOptions) return <></>;

    return (
        <div className="w-full max-w-[980px] mx-auto space-y-6">
            {/* Proposal general details */}
            <div className="w-full max-auto px-10 py-6 bg-white rounded-md shadow-md space-y-4">
                <p className="text-base lg:text-lg">
                    <span className="font-semibold">Create Proposal</span>
                </p>
                <div>
                    <label htmlFor="description" className="font-semibold text-sm lg:text-base">
                        Description
                    </label>
                    <input
                        id="description"
                        aria-label="description"
                        placeholder="This is a proposal to ..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                    />
                </div>
                <div>
                    <label htmlFor="blocks-duration" className="font-semibold text-sm lg:text-base">
                        Blocks Duration (min {MIN_BLOCKS_DURATION} blocks)
                    </label>
                    <input
                        id="blocks-duration"
                        aria-label="blocks-duration"
                        type="number"
                        min={MIN_BLOCKS_DURATION}
                        value={blocksDuration}
                        onChange={(e) => setBlocksDuration(Number(e.target.value))}
                        className="h-10 w-full px-3 border-1 rounded-lg appearance-none border focus:outline-none data-hj-allow"
                    />
                </div>
            </div>

            {/* Proposal function call */}
            <div className="w-full mx-auto px-10 py-6 bg-white rounded-md shadow-md">
                <div>
                    <div className="h-10 w-full mb-2 flex items-center justify-between">
                        <p className="text-base lg:text-lg font-semibold">Proposal Function Call</p>
                    </div>
                    <CreateProposalCall
                        encodedCallData={encodedCallData}
                        setEncodedCallData={(encodedCallData: string) =>
                            setEncodedCallData(encodedCallData)
                        }
                    />
                </div>
            </div>

            {/* Submit button */}
            <div className="w-full mt-4 space-y-4">
                <button
                    onClick={onSubmit}
                    className="w-full py-1 flex items-center justify-center
                    bg-green-600 text-white rounded-md">
                    Submit
                </button>
                <p className="w-full text-center text-red-500 italic">{error}</p>
            </div>
        </div>
    );
};

export default CreateProposal;
