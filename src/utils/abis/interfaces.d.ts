// Libraries
import { ethers } from 'ethers';

export type FunctionInput = {
    name: string;
    type: string;
    arrayChildren?: {
        type: string;
    };
    components?: FunctionInput[];
};

export type FunctionCall = {
    functionName: string;
    inputs: FunctionInput[];
    encodeCallData: (args: unknown[]) => string;
    decodeCallData: (callData: string) => ethers.utils.Result;
};

export type ContractFunctions = Record<string, FunctionCall>;

export type DecodedFunctionCall = {
    functionName: string;
    inputs: FunctionCall['inputs'];
    decodedCallData: ethers.utils.Result;
};
