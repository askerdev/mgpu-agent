import { type ReadableStream } from "node:stream/web";

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  messages: Array<ChatMessage>;
  signal?: AbortSignal;
}

export interface ChatResponse {
  message: ChatMessage;
}

export interface Chat {
  prompt: (request: ChatRequest) => Promise<ReadableStream<ChatResponse>>;
}

export interface EmbeddingsRequest {
  prompt: string;
  signal?: AbortSignal;
}

export interface EmbeddingsResponse {
  embedding: number[];
}

export interface Embeddings {
  embeddings: (request: EmbeddingsRequest) => Promise<EmbeddingsResponse>;
}
