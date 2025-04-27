import {ThemeProvider} from '@gravity-ui/uikit';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createRoot} from 'react-dom/client';
import {Router} from 'wouter';
import {useBrowserLocation} from 'wouter/use-browser-location';

import {App} from './app';

import './globals.css';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <Router hook={useBrowserLocation}>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme="light">
                <App />
            </ThemeProvider>
        </QueryClientProvider>
    </Router>,
);
