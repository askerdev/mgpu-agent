import * as React from 'react';

import transform from '@diplodoc/transform';
import {YfmStaticView} from '@gravity-ui/markdown-editor';

import {useChat} from '../../api/chat';

export function Chat() {
    const [controller] = React.useState(() => new AbortController());
    const [messages, mutate] = useChat({signal: controller.signal});
    const html = React.useMemo(() => transform(messages.join('')).result.html, [messages]);

    const onClick = () => {
        mutate({message: 'Tell me about Elon Musk in 10 sentences'});
    };

    return (
        <>
            <button onClick={onClick}>click</button>
            <YfmStaticView html={html} noListReset />
        </>
    );
}
