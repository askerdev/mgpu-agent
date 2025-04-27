import {request} from './request';

export class ChatService {
    static async *prompt(payload: {message: string}, signal?: AbortSignal) {
        const response = await request.post<ReadableStream>('/chat', payload, {
            headers: {
                Accept: 'text/event-stream',
            },
            responseType: 'stream',
            signal,
        });

        const stream = response.data;

        const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
        while (true) {
            const {value, done} = await reader.read();
            if (done) break;
            yield JSON.parse(value) as {
                role: string;
                content: string;
            };
        }
    }
}
