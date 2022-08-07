// Types
import type { Optional } from '@interfaces/general';

export default {
    opsGovernors: {
        // Local
        1337: process.env.NEXT_PUBLIC_LOCAL_OPS_GOVERNOR_ADDRESS,
        31337: process.env.NEXT_PUBLIC_LOCAL_OPS_GOVERNOR_ADDRESS,
        // Binance smart chain
        56: process.env.NEXT_PUBLIC_BSC_OPS_GOVERNOR_ADDRESS
    } as Record<number, Optional<string>>
};
