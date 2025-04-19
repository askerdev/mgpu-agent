import {PostEndpoints, PostRequest, PostStreamRequestMap, PostStreamResponseMap} from './model';

function createClient() {
    const url = 'http://127.0.0.1:8080';

    return {
        $post: async function* <T extends PostEndpoints, K extends PostStreamRequestMap[T]>(
            req: PostRequest<T, K>,
        ) {
            const response = await fetch(`${url}${req.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body),
                signal: req?.signal,
            });

            if (!response.ok || !response.body) {
                throw new Error('failed to fetch');
            }

            const reader = response.body.getReader();
            const textDecoder = new TextDecoder();
            try {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    const str = textDecoder.decode(value);
                    yield JSON.parse(str) as PostStreamResponseMap[T];
                }
            } finally {
                reader.releaseLock();
            }
        },
    };
}

export const {$post} = createClient();
