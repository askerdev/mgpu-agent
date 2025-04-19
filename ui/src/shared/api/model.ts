export type PostEndpoints = '/chat';

export type RequestOptions = Partial<{
    controller: AbortController;
}>;

export interface PostRequest<Endpoint, Body> {
    endpoint: Endpoint;
    body: Body;
    signal?: AbortController['signal'];
}

export type ResponseMap = {
    [key: string]: unknown;
};

export type PostStreamRequestMap = {
    '/chat': {
        message: string;
    };
};

export type PostStreamResponseMap = {
    '/chat': {
        role: string;
        content: string;
    };
};
