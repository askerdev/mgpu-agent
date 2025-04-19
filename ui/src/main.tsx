import {StrictMode} from 'react';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createRoot} from 'react-dom/client';

import {App} from './app';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import {ThemeProvider} from '@gravity-ui/uikit';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme="light">
                <App />
            </ThemeProvider>
        </QueryClientProvider>
    </StrictMode>,
);
