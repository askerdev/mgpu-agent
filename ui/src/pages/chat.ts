import * as React from 'react';

import {ChatService} from '../services/chat.service';

interface Props {
    signal: AbortSignal;
}

export function useChat({signal}: Props) {
    const [messages, setMessages] = React.useState<string[]>([]);

    const mutate = React.useCallback(async ({message}: {message: string}) => {
        const stream = ChatService.prompt({message}, signal);
        for await (const {content} of stream) {
            setMessages((prev) => [...prev, content]);
        }
    }, []);

    return [messages, mutate] as const;
}
