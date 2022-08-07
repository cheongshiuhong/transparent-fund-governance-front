// Types
import type { NextPage } from 'next';
import type { ReactElement } from 'react';

// Libraries
import Head from 'next/head';

// Code
import Layout from '@components/layout';
import { RetrieveProposal } from '@features/proposals';

/**
 * The proposal page.
 *
 * @returns {ReactElement} - The proposal page component.
 */
const ProposalPage: NextPage = (): ReactElement => {
    return (
        <div className="h-screen w-screen">
            <Head>
                <title>Material Governance</title>
                <meta name="description" content="Material Governance" />
                {/* Favicon here */}
                {/* <link rel="stylesheet" href="/transparent_logo.jpg" /> */}
            </Head>
            <Layout>
                <div className="h-full w-full space-y-8">
                    <RetrieveProposal />
                </div>
            </Layout>
        </div>
    );
};

export default ProposalPage;
