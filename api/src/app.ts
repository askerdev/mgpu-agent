import { streamSSE } from "hono/streaming";
import withOllama from "./ollama_factory";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { setSignedCookie } from "hono/cookie";
import { vkSvc } from "./services/vk";
import { userSvc } from "./services/user";
import { auth } from "./middleware";

const app = withOllama
  .createApp()
  .use(
    cors({
      origin: "https://khuzhokov.ru",
      credentials: true,
    })
  )
  .post(
    "/chat",
    auth(),
    zValidator(
      "json",
      z.object({
        message: z.string().min(1).max(512),
      })
    ),
    async (c) => {
      const body = c.req.valid("json");
      const chat = c.get("chat");
      const response = await chat.prompt({
        messages: [{ role: "user", content: body.message }],
      });
      return streamSSE(c, async (stream) => {
        for await (const { message } of response.values()) {
          stream.writeSSE({
            data: JSON.stringify(message),
            event: "chunk",
          });
        }
        stream.close();
      });
    }
  )
  .get("/auth/me", auth(), async (c) => {
    const user = c.get("user");

    return c.json({ user });
  })
  .post(
    "/auth/vk",
    zValidator(
      "header",
      z.object({
        Authorization: z.string().startsWith("Bearer "),
      })
    ),
    async (c) => {
      const { Authorization } = c.req.valid("header");
      const info = await vkSvc.getUserInfo(
        Authorization.replace("Bearer ", "")
      );
      const user = await userSvc.createOrUpdateUser({
        vk_id: parseInt(info.user.user_id!),
        first_name: info.user.first_name!,
        last_name: info.user.last_name!,
        avatar: info.user.avatar!,
      });
      const date = new Date();

      const session = await userSvc.createSession({
        user_id: user.id,
        expires_at: new Date(date.getTime() + 5 * 60000),
      });

      await setSignedCookie(
        c,
        "session",
        JSON.stringify(session),
        "supersecret",
        {
          path: "/",
          expires: new Date(date.getTime() + 5 * 60000),
          httpOnly: true,
        }
      );

      return c.json({ user });
    }
  );

export default app;
