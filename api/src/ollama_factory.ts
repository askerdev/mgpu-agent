import { createFactory } from "hono/factory";
import { Chat, Embeddings, OllamaChat, OllamaEmbeddings } from "./llm";

type Env = {
  Variables: {
    chat: Chat;
    embeddings: Embeddings;
  };
};

const withOllama = createFactory<Env>({
  initApp: (app) => {
    app.use(async (c, next) => {
      const chat = new OllamaChat({
        model: process.env.OLLAMA_CHAT_MODEL as string,
      });
      const embeddings = new OllamaEmbeddings({
        model: process.env.OLLAMA_EMBEDDINGS_MODEL as string,
      });
      c.set("chat", chat);
      c.set("embeddings", embeddings);
      await next();
    });
  },
});

export default withOllama;
