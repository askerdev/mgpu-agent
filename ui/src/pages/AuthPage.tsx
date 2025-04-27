import * as React from 'react';

import {Box, Flex} from '@gravity-ui/uikit';
import * as VKID from '@vkid/sdk';

import {UserService} from '../services/user.service';

VKID.Config.init({
    app: 53456359,
    redirectUrl: 'https://api.khuzhokov.ru/oauth/vk/callback',
    responseMode: VKID.ConfigResponseMode.Callback,
    scope: 'email',
});

export function AuthPage() {
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

                    await UserService.auth(access_token);
                    window.location.href = '/';
                });

            isMounted.current = true;
        } else if (isMounted.current && !container) {
            oneTap.current.close();
            isMounted.current = false;
        }
    }, []);

    return (
        <Flex justifyContent="center" alignItems="center" height="100dvh">
            <Box ref={ref} width="360px" />
        </Flex>
    );
}
