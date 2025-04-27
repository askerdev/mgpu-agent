import {infiniteQueryOptions} from '@tanstack/react-query';

import {ChatService, GetMessagesResponse, Message} from '../services/chat.service';

interface GetChatMessagesParams extends Record<string, unknown> {
    pageSize?: number;
}

export const getChatMessagesQuery = ({pageSize = 20, ...opts}: GetChatMessagesParams) =>
    infiniteQueryOptions<GetMessagesResponse, Error, Message[], unknown[], string | undefined>({
        queryKey: ['messages', pageSize],
        queryFn: async ({pageParam}) => {
            const data = await ChatService.getMessages({
                cursor: pageParam,
                pageSize,
            });
            return data;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        select: (data) => data.pages.map(({messages}) => messages).flat(),
        ...opts,
    });
