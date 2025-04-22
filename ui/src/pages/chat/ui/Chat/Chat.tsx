import * as React from 'react';

import transform from '@diplodoc/transform';
import {YfmStaticView} from '@gravity-ui/markdown-editor';
import {Card, TextInput} from '@gravity-ui/uikit';

import {useChat} from '../../api/chat';

import styles from './Chat.module.css';

export function Chat() {
    const [controller] = React.useState(() => new AbortController());
    const [messages, mutate] = useChat({signal: controller.signal});
    const html = React.useMemo(() => transform(messages.join('')).result.html, [messages]);

    const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const prompt = formData.get('prompt')?.toString().trim();

        if (!prompt) {
            return;
        }

        event.currentTarget.reset();
        mutate({message: prompt});
    };

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <TextInput name="prompt" placeholder="Write something..." />
            {html ? (
                <Card width="100%" spacing={{p: 6}} view="filled">
                    <YfmStaticView html={html} noListReset />
                </Card>
            ) : null}
        </form>
    );
}
