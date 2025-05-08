from settings.settings import Settings
import requests


def get_user_info(token: str):
    params = {
        "client_id": Settings.auth.vk_client_id,
        "access_token": token,
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    r = requests.post("https://id.vk.com/oauth2/user_info",
                      data=params, headers=headers)
    return r.json()
