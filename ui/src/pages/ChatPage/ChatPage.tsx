import * as React from 'react';

import transform from '@diplodoc/transform';
import {ArrowShapeRight, BroomMotion, CircleStop} from '@gravity-ui/icons';
import {YfmStaticView} from '@gravity-ui/markdown-editor';
import {Button, Card, Flex, Icon, Loader, TextInput, User} from '@gravity-ui/uikit';
import {useInfiniteQuery, useQuery, useQueryClient} from '@tanstack/react-query';

import {useClearMessagesMutation} from '../../queries/clearMessageHistory';
import {getChatMessagesQuery} from '../../queries/getChatMessages';
import {getCurrentUserQuery} from '../../queries/getCurrentUser';
import {ChatService} from '../../services/chat.service';

import styles from './ChatPage.module.css';

export function ChatPage() {
    const scrollIntoView = React.useCallback((div: HTMLDivElement | null) => {
        if (!div) {
            return;
        }
        div.scrollIntoView();
    }, []);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const params = React.useMemo(() => ({pageSize: 20}), []);
    const queryOptions = React.useMemo(() => getChatMessagesQuery(params), [params]);
    const {mutate: clearMessages} = useClearMessagesMutation({
        onSuccess: () => {
            queryClient.invalidateQueries(getChatMessagesQuery(params));
        },
    });
    const {data, isPending, isSuccess} = useInfiniteQuery(queryOptions);
    const userQueryOptions = React.useMemo(() => getCurrentUserQuery(), []);
    const userQuery = useQuery(userQueryOptions);

    const htmlData = React.useMemo(() => {
        if (!isSuccess || !data) {
            return [];
        }

        const items = data.map(({id, role, content, created_at}) => ({
            id,
            role,
            html: transform(content).result.html,
            createdAt: new Date(created_at),
        }));

        return items.sort((a, b) => {
            return a.createdAt.getTime() - b.createdAt.getTime() || a.role === 'user' ? -1 : 1;
        });
    }, [data, isSuccess]);

    const [controller, setController] = React.useState(() => new AbortController());
    const [isLoadingAnswer, setIsLoadingAnswer] = React.useState(false);
    const [isPrompting, setIsPrompting] = React.useState(false);
    const [currentAnswer, setCurrentAnswer] = React.useState('');
    const [currentPrompt, setCurrentPrompt] = React.useState('');
    const currentPromptHTML = React.useMemo(
        () => transform(currentPrompt).result.html,
        [currentPrompt],
    );
    const currentAnswerHTML = React.useMemo(
        () => transform(currentAnswer).result.html,
        [currentAnswer],
    );

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const prompt = formData.get('prompt')?.toString().trim();

        if (!prompt) {
            return;
        }

        event.currentTarget.reset();
        setIsPrompting(true);
        setCurrentPrompt(prompt);
        setIsLoadingAnswer(true);
        try {
            const stream = await ChatService.prompt({message: prompt}, controller.signal);
            setIsLoadingAnswer(false);
            for await (const {content} of stream()) {
                setCurrentAnswer((prev) => prev + content);
            }
        } finally {
            setIsLoadingAnswer(false);
            setIsPrompting(false);
            await queryClient.invalidateQueries(getChatMessagesQuery(params));
            setCurrentAnswer('');
            setCurrentPrompt('');
        }
    };

    const onAbort = () => {
        try {
            controller.abort();
        } finally {
            setController(new AbortController());
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {isPending ? (
                    <Flex
                        width="100%"
                        height="100%"
                        justifyContent={'center'}
                        alignItems={'center'}
                    >
                        <Loader size="l" />{' '}
                    </Flex>
                ) : null}
                {isSuccess && (
                    <div className={styles.messages}>
                        {htmlData.map((msg) => (
                            <Card
                                className={msg.role === 'user' ? styles.message_user : undefined}
                                width="90%"
                                key={msg.id}
                                spacing={{p: 6}}
                                view={msg.role === 'user' ? 'outlined' : 'filled'}
                            >
                                <YfmStaticView html={msg.html} noListReset />
                            </Card>
                        ))}
                        {currentPromptHTML ? (
                            <Card
                                width="90%"
                                spacing={{p: 6}}
                                view="outlined"
                                className={styles.message_user}
                            >
                                <YfmStaticView html={currentPromptHTML} noListReset />
                            </Card>
                        ) : null}
                        {currentAnswerHTML || isLoadingAnswer ? (
                            <Card width="90%" spacing={{p: 6}} view="filled">
                                {isLoadingAnswer ? (
                                    <Loader size="m" />
                                ) : (
                                    <YfmStaticView html={currentAnswerHTML} noListReset />
                                )}
                            </Card>
                        ) : null}

                        <div
                            key={String(htmlData.length) + currentAnswerHTML}
                            ref={scrollIntoView}
                        />
                    </div>
                )}

                <form onSubmit={onSubmit} style={{width: '100%'}}>
                    <Flex width="100%" gap={1}>
                        <Button
                            disabled={isPrompting || isPending}
                            view="normal"
                            size="l"
                            type="button"
                            onClick={() => clearMessages()}
                        >
                            <Icon data={BroomMotion} />
                        </Button>
                        <TextInput
                            disabled={isPrompting || isPending}
                            size="l"
                            ref={inputRef}
                            name="prompt"
                            placeholder="Write something..."
                        />
                        <Button
                            view={isPrompting ? 'action' : 'normal'}
                            size="l"
                            type={isPrompting ? 'button' : 'submit'}
                            onClick={isPrompting ? onAbort : undefined}
                            disabled={isPending}
                        >
                            <Icon data={isPrompting ? CircleStop : ArrowShapeRight} />
                        </Button>
                    </Flex>
                </form>
            </div>
            {userQuery.isSuccess ? (
                <User
                    avatar={userQuery.data.user.avatar}
                    name={`${userQuery.data.user.last_name} ${userQuery.data.user.first_name}`}
                />
            ) : null}
        </div>
    );
}
