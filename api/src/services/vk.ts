import type { UserInfoResult } from "@vkid/sdk";

export class VkService {
  async getUserInfo(access_token: string): Promise<UserInfoResult> {
    const response = await fetch(
      `https://${process.env.VKID_DOMAIN}/oauth2/user_info`,
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: process.env.VK_CLIENT_ID,
          access_token,
        }),
      }
    );

    const data = await response.json();

    return data;
  }
}

export const vkSvc = new VkService();
