import {Flex, Loader} from '@gravity-ui/uikit';
import {useQuery} from '@tanstack/react-query';

import {AuthPage} from './pages/AuthPage';
import {ChatPage} from './pages/ChatPage/ChatPage';
import {getCurrentUserQuery} from './queries/getCurrentUser';

export function App() {
    const {isSuccess, isPending} = useQuery(getCurrentUserQuery());

    if (isPending) {
        return (
            <Flex width="100%" height="100dvh" justifyContent={'center'} alignItems={'center'}>
                <Loader size="l" />
            </Flex>
        );
    }

    return isSuccess ? <ChatPage /> : <AuthPage />;
}
