import * as React from 'react';

import transform from '@diplodoc/transform';
import {ArrowShapeRight, BroomMotion, CircleStop} from '@gravity-ui/icons';
import {YfmStaticView} from '@gravity-ui/markdown-editor';
import {Button, Card, Flex, Icon, Loader, TextInput, User} from '@gravity-ui/uikit';
import {useInfiniteQuery, useQuery, useQueryClient} from '@tanstack/react-query';
import {ErrorBoundary} from 'react-error-boundary';

import {useClearMessagesMutation} from '../../queries/clearMessageHistory';
import {getChatMessagesQuery} from '../../queries/getChatMessages';
import {getCurrentUserQuery} from '../../queries/getCurrentUser';
import {ChatService} from '../../services/chat.service';

import styles from './ChatPage.module.css';

const getHtml = (markdown: string): string => {
    try {
        return transform(markdown).result.html;
    } catch (_) {
        return markdown;
    }
};

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
            html: getHtml(content),
            createdAt: new Date(created_at),
        }));

        return items.sort((a, b) => {
            return a.id - b.id;
        });
    }, [data, isSuccess]);

    const [controller, setController] = React.useState(() => new AbortController());
    const [isLoadingAnswer, setIsLoadingAnswer] = React.useState(false);
    const [isPrompting, setIsPrompting] = React.useState(false);
    const [currentAnswer, setCurrentAnswer] = React.useState('');
    const [currentPrompt, setCurrentPrompt] = React.useState('');
    const currentPromptHTML = React.useMemo(() => getHtml(currentPrompt), [currentPrompt]);
    const currentAnswerHTML = React.useMemo(() => getHtml(currentAnswer), [currentAnswer]);

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
            let isRecv = false;
            for await (const {content} of stream()) {
                setCurrentAnswer((prev) => prev + content);
                if (!isRecv && content.length) {
                    setIsLoadingAnswer(false);
                    isRecv = true;
                }
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
                                <ErrorBoundary fallback={msg.html}>
                                    <YfmStaticView html={msg.html} noListReset />
                                </ErrorBoundary>
                            </Card>
                        ))}
                        {currentPromptHTML ? (
                            <Card
                                width="90%"
                                spacing={{p: 6}}
                                view="outlined"
                                className={styles.message_user}
                            >
                                <ErrorBoundary fallback={currentPromptHTML}>
                                    <YfmStaticView html={currentPromptHTML} noListReset />
                                </ErrorBoundary>
                            </Card>
                        ) : null}
                        {currentAnswerHTML || isLoadingAnswer ? (
                            <Card width="90%" spacing={{p: 6}} view="filled">
                                {isLoadingAnswer ? (
                                    <Loader size="m" />
                                ) : (
                                    <ErrorBoundary fallback={currentAnswerHTML}>
                                        <YfmStaticView html={currentAnswerHTML} noListReset />
                                    </ErrorBoundary>
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
