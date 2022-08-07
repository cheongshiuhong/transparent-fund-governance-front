// Types
import type { ContractFunctions } from './interfaces';
import type { Contract } from 'ethers';

// Constants
import contracts from '@constants/contracts';

/**
 * Gets the functions from the contract object's abi.
 *
 * @param {Contract} contract - The contract object.
 * @returns {ContractFunctions} - The mapping from selector the the details.
 */
const getContractFunctions = (contract: Contract): ContractFunctions => {
    const calls: ContractFunctions = {};

    for (const funcName in contract.functions) {
        const func = contract.interface.getFunction(funcName);

        // Exclude view and pure functions
        if (['view', 'pure'].includes(func.stateMutability)) continue;

        const selector = contract.interface.getSighash(func);
        calls[selector] = {
            functionName: funcName,
            inputs: func.inputs,
            encodeCallData: (args: unknown[]) => contract.interface.encodeFunctionData(func, args),
            decodeCallData: (callData: string) =>
                contract.interface.decodeFunctionData(func, callData)
        };
    }
    return calls;
};

export default getContractFunctions(contracts.opsGovernor);
