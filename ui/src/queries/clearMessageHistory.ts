import {type UseMutationOptions, useMutation} from '@tanstack/react-query';

import {ChatService} from '../services/chat.service';

export const useClearMessagesMutation = (opts?: UseMutationOptions<any, Error, void, unknown>) => {
    return useMutation({
        mutationFn: () => ChatService.clearMessages(),
        ...opts,
    });
};
