import { ReactNode } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type WrapperProps = {
    children?: ReactNode;
};

export type EnumType<T> = {
    label: string;
    value: T;
};

export type Proposal = {
    id: BigNumber;
    proposer: string;
    description: string;
    callData: string;
    votesFor: BigNumber;
    votesAgainst: BigNumber;
    status: number;
    startBlock: number;
    endBlock: number;
    blockExecuted: number;
};

export type Vote = {
    voter: string;
    direction: number;
};
