import * as React from 'react';

import {$post} from '../../../shared/api';

interface Props {
    signal: AbortSignal;
}

export function useChat({signal}: Props) {
    const [messages, setMessages] = React.useState<string[]>([]);

    const mutate = React.useCallback(async ({message}: {message: string}) => {
        const stream = $post({
            endpoint: '/chat',
            body: {message},
            signal,
        });
        for await (const {content} of stream) {
            setMessages((prev) => [...prev, content]);
        }
    }, []);

    return [messages, mutate] as const;
}
