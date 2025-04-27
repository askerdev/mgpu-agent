import {useEffect} from 'react';

import {User} from '@gravity-ui/uikit';
import {useQuery} from '@tanstack/react-query';
import {Route, Router, Switch} from 'wouter';
import {useBrowserLocation} from 'wouter/use-browser-location';

import {AuthPage} from './pages/AuthPage';
import {ChatPage} from './pages/ChatPage';
import {getCurrentUserQuery} from './queries/getCurrentUser';

export function App() {
    const {data, isFetched, isSuccess} = useQuery(getCurrentUserQuery());

    useEffect(() => {
        if (isFetched && !isSuccess) {
            window.location.href = '/auth';
        }
    }, [isFetched, isSuccess]);

    return (
        <>
            {isSuccess ? (
                <User
                    avatar={data.user.avatar}
                    name={`${data.user.last_name} ${data.user.first_name}`}
                    size="xl"
                />
            ) : null}
            <Router hook={useBrowserLocation}>
                <Switch>
                    {isSuccess ? (
                        <Route component={ChatPage}></Route>
                    ) : (
                        <Route path="/auth" component={AuthPage} />
                    )}
                </Switch>
            </Router>
        </>
    );
}
