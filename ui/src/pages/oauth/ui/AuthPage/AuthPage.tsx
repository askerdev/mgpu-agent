import * as React from 'react';

import {Box, Flex, User} from '@gravity-ui/uikit';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import * as VKID from '@vkid/sdk';

import {post} from '../../../../shared/api';

VKID.Config.init({
    app: 53456359,
    redirectUrl: 'https://api.khuzhokov.ru/oauth/vk/callback',
    responseMode: VKID.ConfigResponseMode.Callback,
    scope: 'email',
});

const authQueryKey = ['auth', 'user'];

export function AuthPage() {
    const queryClient = useQueryClient();
    const {data} = useQuery<VKID.UserInfoResult | null>({
        queryKey: authQueryKey,
        queryFn: () => null,
    });
    const isMounted = React.useRef(false);
    const oneTap = React.useRef(new VKID.OneTap());

    const ref = React.useCallback((container: HTMLDivElement | null) => {
        if (!isMounted.current && container) {
            oneTap.current
                .render({
                    container,
                    showAlternativeLogin: true,
                })
                .on(VKID.WidgetEvents.ERROR, console.error)
                .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, async (payload: VKID.AuthResponse) => {
                    const code = payload.code;
                    const deviceId = payload.device_id;

                    const {access_token} = await VKID.Auth.exchangeCode(code, deviceId);
                    const result = await post({
                        endpoint: '/oauth/vk',
                        body: undefined,
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                    });
                    queryClient.setQueryData(authQueryKey, result);
                });

            isMounted.current = true;
        } else if (isMounted.current && !container) {
            oneTap.current.close();
            isMounted.current = false;
        }
    }, []);

    return (
        <Flex justifyContent="center" alignItems="center" height="100dvh">
            {data ? (
                <User
                    avatar={data.user.avatar}
                    name={`${data.user.last_name} ${data.user.first_name}`}
                    description={data.user.email}
                    size="xl"
                />
            ) : (
                <Box ref={ref} width="360px" />
            )}
        </Flex>
    );
}
