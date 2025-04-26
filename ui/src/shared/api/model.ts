import type {UserInfoResult} from '@vkid/sdk';

export type PostEndpoints = '/chat' | '/oauth/vk';

export type RequestOptions = Partial<{
    controller: AbortController;
}>;

export interface PostRequest<Endpoint, Body> {
    endpoint: Endpoint;
    body: Body;
    signal?: AbortController['signal'];
    headers?: Record<string, unknown>;
}

export type ResponseMap = {
    [key: string]: unknown;
};

export type PostRequestMap = {
    '/oauth/vk': undefined;
    '/chat': {
        message: string;
    };
};

export type PostResponseMap = {
    '/oauth/vk': UserInfoResult;
    '/chat': {
        role: string;
        content: string;
    };
};

export type PostStreamRequestMap = {
    '/oauth/vk': undefined;
    '/chat': {
        message: string;
    };
};

export type PostStreamResponseMap = {
    '/oauth/vk': {
        Authorization: string;
    };
    '/chat': {
        role: string;
        content: string;
    };
};
