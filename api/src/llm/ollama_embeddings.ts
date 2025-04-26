import { ollama } from "./ollama";
import { Embeddings, EmbeddingsRequest, EmbeddingsResponse } from "./llm";

export interface OllamaEmbeddingsOptions {
  model: "nomic-embed-text";
}

export class OllamaEmbeddings implements Embeddings {
  constructor(private readonly options: OllamaEmbeddingsOptions) {}

  async embeddings({ prompt }: EmbeddingsRequest): Promise<EmbeddingsResponse> {
    const { embedding } = await ollama.embeddings({
      model: this.options.model,
      prompt,
    });

    return {
      embedding,
    };
  }
}
