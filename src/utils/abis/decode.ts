// Types
import type { DecodedFunctionCall } from './interfaces';

// Code
import calls from './calls';

/**
 * Decodes the call data for a call on a contract.
 *
 * @param {string} callData - The encoded hexadecimal string of the call data.
 * @returns {DecodedFunctionCall} - The decoded info on the call address and data.
 */
const decodeAbi = (callData: string): DecodedFunctionCall => {
    const selector = callData.slice(0, 10);

    // Try to match an address-specific call then a generic call
    const matchedCall = calls[selector];
    if (matchedCall) {
        return {
            functionName: matchedCall.functionName,
            inputs: matchedCall.inputs,
            decodedCallData: matchedCall.decodeCallData(callData)
        };
    }

    // Default case where no selectors match
    return {
        functionName: 'Unknown',
        inputs: [{ name: 'raw', type: 'bytes' }],
        decodedCallData: [callData]
    };
};

export default decodeAbi;
