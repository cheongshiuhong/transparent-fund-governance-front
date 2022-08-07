// Types
import type { Web3Provider } from '@ethersproject/providers';
import type { WrapperProps, Nullable } from '@interfaces/general';

// Libraries
import { FC, ReactElement, createContext, useContext, useState, useEffect } from 'react';
import { providers } from 'ethers';
import Web3Modal from 'web3modal';

// Code
import addresses from '@constants/addresses';
import contracts from '@constants/contracts';
import providerOptions from './providerOptions';

interface IWeb3Context {
    isLoading: boolean;
    provider: Web3Provider | null;
    chainId: number;
    userAddress: string | null;
    userState: {
        isManager: boolean;
    };
    connectWallet: () => Promise<void>;
}

/** Context default fallback values */
const DEFAULT_CHAIN = -1;
const DEFAULT_USER_STATE = { isManager: false };
const Web3Context = createContext<IWeb3Context>({
    isLoading: false,
    provider: null,
    chainId: DEFAULT_CHAIN,
    userAddress: null,
    userState: DEFAULT_USER_STATE,
    connectWallet: async () => console.warn('No context provided.')
});

/**
 * Context hook.
 *
 * @returns {IWeb3Context} - The context object.
 */
export const useWeb3Context = (): IWeb3Context => useContext(Web3Context);

/**
 * Web3 context provider.
 *
 * @param {WrapperProps} props - The children to provide context to.
 * @returns {ReactElement} - The children with the context provided.
 */
export const Web3ContextProvider: FC<WrapperProps> = ({ children }: WrapperProps): ReactElement => {
    const [isLoading, setIsLoading] = useState<IWeb3Context['isLoading']>(false);
    const [web3Modal, setWeb3Modal] = useState<Nullable<Web3Modal>>(null);
    const [provider, setProvider] = useState<IWeb3Context['provider']>(null);
    const [chainId, setChainId] = useState<IWeb3Context['chainId']>(DEFAULT_CHAIN);
    const [userAddress, setUserAddress] = useState<IWeb3Context['userAddress']>(null);
    const [userState, setUserState] = useState<IWeb3Context['userState']>(DEFAULT_USER_STATE);

    /** Effect to setup the web3 modal */
    useEffect(() => {
        /** Web3 provider setup */
        setWeb3Modal(
            new Web3Modal({
                cacheProvider: true,
                providerOptions
            })
        );
    }, []);

    /** Effect to check for cached users */
    useEffect(() => {
        if (web3Modal && web3Modal.cachedProvider) connectWallet();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [web3Modal]);

    /** Effect to check for user when provider changes */
    useEffect(() => {
        if (provider) {
            const onAccountsChanged = async (): Promise<void> => {
                const accounts = await provider.listAccounts();

                // Unset the account if no accounts
                if (accounts.length === 0) {
                    setUserAddress(null);
                    return;
                }
                setUserAddress(accounts[0]);
            };

            const onChainChanged = async (): Promise<void> => {
                const { chainId } = await provider.getNetwork();
                setChainId(chainId);
            };

            window.ethereum && window.ethereum.on('accountsChanged', onAccountsChanged);
            provider.addListener('network', onChainChanged);

            return () => {
                window.ethereum.removeAllListeners();
                provider.removeAllListeners();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider]);

    /** Effect to update the user state and allowed routes whenever user address changes */
    useEffect(() => {
        const fetchUserState = async (): Promise<void> => {
            if (!userAddress || !provider) return;

            setIsLoading(true);

            // Just reload chain if still not loaded (workaround for glitchy behaviour)
            if (chainId === -1) {
                const { chainId } = await provider.getNetwork();
                setChainId(chainId);
            }

            try {
                const opsGovernorAddress = addresses.opsGovernors[chainId];

                // Network not supported
                if (!opsGovernorAddress) {
                    setUserState({ isManager: false });
                    return;
                }

                const opsGovernorContract = contracts.opsGovernor
                    .connect(provider)
                    .attach(opsGovernorAddress);
                const managers = await opsGovernorContract.getManagers();

                setUserState({ isManager: managers.includes(userAddress) });
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAddress, chainId]);

    /** Connects the wallet */
    const connectWallet = async (): Promise<void> => {
        if (!web3Modal) return;

        try {
            const instance = await web3Modal.connect();
            const provider = new providers.Web3Provider(instance);
            const userAddress = await provider.getSigner().getAddress();

            setProvider(provider);
            setUserAddress(userAddress);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Web3Context.Provider
            value={{
                isLoading,
                provider,
                chainId,
                userAddress,
                userState,
                connectWallet
            }}>
            {children}
        </Web3Context.Provider>
    );
};
