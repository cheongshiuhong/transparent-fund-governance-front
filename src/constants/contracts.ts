// Types
import type { Contract } from 'ethers';

// Libraries
import { ethers } from 'ethers';

// ABIs
import OpsGovernorABI from '@abis/OpsGovernor.json';

export default {
    opsGovernor: new ethers.Contract(ethers.constants.AddressZero, OpsGovernorABI)
} as Record<string, Contract>;
