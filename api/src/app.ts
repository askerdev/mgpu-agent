import { stream } from "hono/streaming";
import withOllama from "./ollama_factory";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";

const app = withOllama
  .createApp()
  .use(
    cors({
      origin: "*",
    })
  )
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
  );

export default app;
