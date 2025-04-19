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
      const chat = new OllamaChat({ model: "gemma3:1b" });
      const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });
      c.set("chat", chat);
      c.set("embeddings", embeddings);
      await next();
    });
  },
});

export default withOllama;
