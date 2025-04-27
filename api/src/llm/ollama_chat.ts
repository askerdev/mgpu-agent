import { ollama } from "./ollama";
import { ReadableStream } from "stream/web";
import { Chat, ChatRequest, ChatResponse } from "./llm";

export interface OllamaChatOptions {
  model: "gemma3:1b" | string;
}

export class OllamaChat implements Chat {
  constructor(private readonly options: OllamaChatOptions) {}

  async prompt({
    messages,
    signal,
  }: ChatRequest): Promise<ReadableStream<ChatResponse>> {
    const response = await ollama.chat({
      model: this.options.model,
      messages,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const { message } of response) {
          controller.enqueue({ message });
        }
        controller.close();
      },
      cancel() {
        response.abort();
      },
    });

    signal?.addEventListener("abort", () => {
      response.abort();
    });

    return stream;
  }
}
