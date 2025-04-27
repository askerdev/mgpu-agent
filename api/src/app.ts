import { streamSSE } from "hono/streaming";
import withOllama from "./ollama_factory";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { setSignedCookie } from "hono/cookie";
import { vkSvc } from "./services/vk";
import { userSvc } from "./services/user";
import { auth } from "./middleware";
import { chatSvc } from "./services/chat";
import { sql } from "./postgres";

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

      const { id } = c.get("user");
      const dbChat = await chatSvc.getChat(id);

      const response = await chat.prompt({
        messages: [{ role: "user", content: body.message }],
        signal: c.req.raw.signal,
      });

      return streamSSE(c, async (stream) => {
        let content = "";
        for await (const { message } of response.values()) {
          content += message.content;
          stream.writeSSE({
            data: JSON.stringify(message),
            event: "chunk",
          });
        }
        await sql
          .begin(async (tx) => {
            await chatSvc.createMessage(
              {
                chat_id: dbChat.id,
                content: body.message,
                role: "user",
              },
              tx
            );
            await chatSvc.createMessage(
              {
                chat_id: dbChat.id,
                content,
                role: "assistant",
              },
              tx
            );
          })
          .catch(console.error);
        stream.close();
      });
    }
  )
  .delete("/messages/history", auth(), async (c) => {
    const { id } = c.get("user");
    chatSvc.deleteMessages(id);
    return c.json({ success: true });
  })
  .get(
    "/messages",
    auth(),
    zValidator(
      "query",
      z.object({
        cursor: z.string().optional(),
        pageSize: z.preprocess(
          (v) => parseInt(z.string().parse(v), 10),
          z.number().positive().min(1).max(20)
        ),
      })
    ),
    async (c) => {
      const { cursor, pageSize } = c.req.valid("query");
      const { id } = c.get("user");

      const messages = await chatSvc.getMessages({
        userId: id,
        pageSize,
        cursor,
      });

      return c.json(messages);
    }
  )
  .get("/auth/me", auth(), async (c) => {
    const user = c.get("user");

    return c.json({ user });
  })
  .get("/oauth/vk/callback", (c) => c.redirect("https://khuzhokov.ru"))
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
