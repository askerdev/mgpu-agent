import postgres from "postgres";
import { sql, Chat, Message } from "../postgres";

interface CreateMessageParams {
  chat_id: string;
  content: string;
  role: string;
}

interface GetMessagesParams {
  userId: string;
  cursor?: string;
  pageSize: number;
}

export class ChatService {
  async getChat(userId: string) {
    let chat: Chat;
    const [recievedChat] = await sql`
      SELECT * FROM chats WHERE user_id = ${userId}
   `;

    if (!recievedChat) {
      const [createdChat] = await sql`INSERT INTO chats ${sql(
        {
          user_id: userId,
        },
        "user_id"
      )}`;
      chat = createdChat as Chat;
    } else {
      chat = recievedChat as Chat;
    }

    return chat;
  }

  async createMessage(
    params: CreateMessageParams,
    tx?: postgres.TransactionSql<{}>
  ) {
    const q = tx ?? sql;
    const [msg] = await q`INSERT INTO messages ${q(
      params,
      "chat_id",
      "content",
      "role"
    )} RETURNING *`;

    return msg as Message;
  }

  async deleteMessages(userId: string) {
    const chat = await this.getChat(userId);
    await sql`DELETE FROM messages WHERE chat_id = ${chat.id}`;
  }

  async getMessages({ userId, cursor, pageSize }: GetMessagesParams) {
    const chat = await this.getChat(userId);
    const [lastCreatedAt, lastId] = cursor ? cursor.split(",") : [null, null];

    if (cursor && (!lastCreatedAt || !lastId)) {
      throw new Error("Invalid cursor format");
    }

    let messages = (await sql`
      SELECT 
        m.id,
        m.content,
        m.role,
        m.created_at
      FROM messages m
      WHERE m.chat_id = ${chat.id}
      ${
        cursor
          ? sql`
            AND m.created_at < ${lastCreatedAt}::timestamptz
          `
          : sql``
      }
      ORDER BY m.created_at DESC
      LIMIT ${pageSize + 1}
    `) as Message[];

    let nextCursor: string | null = null;
    if (messages.length > pageSize) {
      const lastMessage = messages[pageSize - 1];
      nextCursor = `${lastMessage.created_at.toISOString()},${lastMessage.id}`;
      messages = messages.slice(0, pageSize);
    }

    return {
      messages: messages as unknown as Message[],
      nextCursor,
    };
  }
}

export const chatSvc = new ChatService();
