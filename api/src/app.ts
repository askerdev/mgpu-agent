import { stream } from "hono/streaming";
import withOllama from "./ollama_factory";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { getSignedCookie, setSignedCookie, deleteCookie } from "hono/cookie";
import { VkService } from "./services/vk";
import { UserService } from "./services/user";
import { Session } from "./postgres";

const vk = new VkService();
const userSvc = new UserService();

const app = withOllama
  .createApp()
  .use(
    cors({
      origin: "https://khuzhokov.ru",
      credentials: true,
    })
  )
  .use("/chat", async (c, next) => {
    const raw = await getSignedCookie(c, "supersecret", "session");
    console.log(raw);

    if (!raw) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }

    const { id } = JSON.parse(raw) as Session;

    if (!id) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }

    const session = await userSvc.getSession(id);

    if (!session) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }

    await next();
  })
  .post(
    "/chat",
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
      return stream(c, async (stream) => {
        for await (const { message } of response.values()) {
          stream.write(JSON.stringify(message));
        }
        stream.close();
      });
    }
  )
  .post(
    "/oauth/vk",
    zValidator(
      "header",
      z.object({
        Authorization: z.string().startsWith("Bearer "),
      })
    ),
    async (c) => {
      const { Authorization } = c.req.valid("header");
      const info = await vk.getUserInfo(Authorization.replace("Bearer ", ""));
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
