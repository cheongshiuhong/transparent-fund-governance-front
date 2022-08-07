// Types
import type { FC, ReactElement } from 'react';

// Code
import useOpsGovernor from './hooks/useOpsGovernor';
import ExplorerLink from './ExplorerLink';

/**
 * The overview component.
 *
 * @returns {ReactElement} - The overview component.
 */
const Overview: FC = (): ReactElement => {
    const { managers, operators, tokens, protocols, utils } = useOpsGovernor();

    return (
        <div className="w-full max-w-[1080px] mx-auto space-y-8">
            <div className="h-auto xl:h-[280px] w-full grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Managers */}
                <div
                    className="h-full w-full px-4 py-3 overflow-y-auto 
                    divide-y divide-translucent-light-gray
                    bg-white rounded-md shadow-md">
                    <p className="font-semibold py-1">Maangers</p>
                    {managers.map((manager) => (
                        <p key={manager} className="py-1 text-sm">
                            <span className="font-semibold">Address</span>:&nbsp;
                            <ExplorerLink address={manager} />
                        </p>
                    ))}
                </div>
                {/* Operators */}
                <div
                    className="h-full w-full px-4 py-3 overflow-y-auto
                    divide-y divide-translucent-light-gray
                    bg-white rounded-md shadow-md">
                    <p className="font-semibold py-1">Operators</p>
                    {operators.map((operator) => (
                        <p key={operator} className="py-1 text-sm">
                            <span className="font-semibold">Address</span>:&nbsp;
                            <ExplorerLink address={operator} />
                        </p>
                    ))}
                </div>
            </div>
            <div className="h-auto xl:h-[280px] w-full grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Tokens */}
                <div
                    className="h-full w-full px-4 py-3 overflow-y-auto
                    divide-y divide-translucent-light-gray
                    bg-white rounded-md shadow-md">
                    <p className="font-semibold py-1">Tokens</p>
                    {tokens.map((token) => (
                        <p key={token} className="py-1 text-sm">
                            <span className="font-semibold">Address</span>:&nbsp;
                            <ExplorerLink address={token} />
                        </p>
                    ))}
                </div>
                {/* Protocols */}
                <div
                    className="h-full w-full px-4 py-3 overflow-y-auto
                    divide-y divide-translucent-light-gray
                    bg-white rounded-md shadow-md">
                    <p className="font-semibold py-1">Protocols</p>
                    {protocols.map((protocol) => (
                        <p key={protocol} className="py-1 text-sm">
                            <span className="font-semibold">Address</span>:&nbsp;
                            <ExplorerLink address={protocol} />
                        </p>
                    ))}
                </div>
            </div>
            <div className="h-auto xl:h-[280px] w-full grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Utils */}
                <div
                    className="h-full w-full px-4 py-3 overflow-y-auto
                    divide-y divide-translucent-light-gray
                    bg-white rounded-md shadow-md">
                    <p className="font-semibold py-1">Utils</p>
                    {utils.map((util) => (
                        <p key={util} className="py-1 text-sm">
                            <span className="font-semibold">Address</span>:&nbsp;
                            <ExplorerLink address={util} />
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Overview;
