import { BigNumber } from '@ethersproject/bignumber';
import { EnumType } from '@interfaces/general';

export type InputValues = {
    function: EnumType<string>;
    arguments: unknown[];
    value: BigNumber;
};
