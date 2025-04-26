import {
    PostEndpoints,
    PostRequest,
    PostRequestMap,
    PostResponseMap,
    PostStreamRequestMap,
    PostStreamResponseMap,
} from './model';

function createClient() {
    const url = import.meta.env.VITE_API_URI;

    return {
        post: async function <T extends PostEndpoints, K extends PostRequestMap[T]>(
            req: PostRequest<T, K>,
        ) {
            const response = await fetch(`${url}${req.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...req.headers,
                },
                body: JSON.stringify(req.body),
                signal: req?.signal,
                credentials: 'include',
            });

            if (!response.ok || !response.body) {
                throw new Error('failed to fetch');
            }

            const data = await response.json();

            return data as PostResponseMap[T];
        },
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
                credentials: 'include',
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

export const {$post, post} = createClient();
