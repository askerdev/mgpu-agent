import {queryOptions} from '@tanstack/react-query';

import {UserService} from '../services/user.service';

export const getCurrentUserQuery = () =>
    queryOptions({
        queryKey: ['auth', 'me'],
        queryFn: () => UserService.me(),
        retry: 0,
    });
