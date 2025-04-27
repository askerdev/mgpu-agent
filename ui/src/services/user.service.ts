import type {UserInfoResult} from '@vkid/sdk';

import {request} from './request';

export class UserService {
    static async me() {
        const {data} = await request.get<UserInfoResult>('/auth/me');

        return data;
    }

    static async auth(accessToken: string) {
        const {data} = await request.post<UserInfoResult>('/auth/vk', undefined, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data;
    }
}
