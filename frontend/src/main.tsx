import React from 'react';

import { createRoot } from 'react-dom/client';

import App from './App';

import keycloak from './auth/keycloak';

import './index.css';


async function startApplication() {

    try {

        const authenticated = await keycloak.init({
            onLoad: 'check-sso',
            pkceMethod: 'S256',
            checkLoginIframe: false
        });

        console.log(
            'Keycloak initialized:',
            authenticated
        );


        const rootElement =
            document.getElementById('root');


        if (!rootElement) {

            throw new Error(
                'Root element was not found'
            );
        }


        createRoot(rootElement).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );

    } catch (error) {

        console.error(
            'Keycloak initialization failed:',
            error
        );

    }
}


startApplication();