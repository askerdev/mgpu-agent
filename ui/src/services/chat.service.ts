import {request} from './request';

export interface Message {
    id: number;
    content: string;
    role: string;
    created_at: string;
}

export interface GetMessagesResponse {
    messages: Message[];
    nextCursor?: string;
}

export class ChatService {
    static async prompt(payload: {message: string}, signal?: AbortSignal) {
        const response = await fetch(`${import.meta.env.VITE_API_URI}/chat`, {
            method: 'POST',
            headers: {
                Accept: 'text/event-stream',
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(payload),
            signal,
            credentials: 'include',
        });

        return async function* () {
            if (!response.body) return;

            const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
            while (true) {
                const {value, done} = await reader.read();
                if (done || signal?.aborted) break;
                const [event, data] = value.split('\n');
                if (event.slice(7) !== 'chunk') {
                    continue;
                }
                yield JSON.parse(data.slice(6)) as {
                    role: string;
                    content: string;
                };
            }
        };
    }

    static async getMessages(params?: {cursor?: string; pageSize?: number}) {
        const response = await request.get<GetMessagesResponse>('/messages', {
            params: {
                pageSize: params?.pageSize || 20,
                cursor: params?.cursor,
            },
        });
        return response.data;
    }

    static async clearMessages() {
        const response = await request.delete('/messages/history');
        return response.data;
    }
}
