// Types
import type { FC, ReactElement } from 'react';

// Libraries
import { GiBlackBook } from 'react-icons/gi';

// Code
import useRouter from '@hooks/useRouter';

/**
 * The navigation component to show where the user is allowed to go.
 *
 * @returns {ReactElement} - The navigation component.
 */
const Navigation: FC = (): ReactElement => {
    const { redirect } = useRouter();

    return (
        <div className="w-screen">
            <div className="w-full mx-auto mt-6">
                <p className="text-center text-lg lg:text-xl font-bold">
                    Transparent Ops Governance
                </p>
            </div>
            <div className="w-full mx-auto mt-10 flex items-center justify-center space-x-8">
                <button
                    onClick={() => redirect('/proposals')}
                    className="w-40 px-4 py-4 flex flex-col items-center justify-between space-y-2
                    bg-white rounded-md shadow-md">
                    <GiBlackBook size={30} />
                    <span className="text-base lg:text-lg font-semibold">Proposals</span>
                </button>
            </div>
        </div>
    );
};

export default Navigation;
