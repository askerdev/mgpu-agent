import { sql, Session, User } from "../postgres";

interface CreateOrUpdateUserParams {
  vk_id: number;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface CreateSessionParams {
  user_id: string;
  expires_at: Date;
}

export class UserService {
  async createSession(params: CreateSessionParams): Promise<Session | null> {
    const [session] = await sql`
      INSERT INTO sessions ${sql(params, "user_id", "expires_at")} RETURNING *
    `;
    return session as Session;
  }

  async getSession(id: string): Promise<Session | null> {
    const [session] = await sql`
      SELECT
         id, user_id, expires_at, created_at
      FROM sessions
      WHERE id = ${id}
    `;

    if (!session) {
      return null;
    }

    return session as Session;
  }

  async createOrUpdateUser(params: CreateOrUpdateUserParams) {
    const [user] = await sql`
      INSERT INTO
         users
      ${sql(params, "vk_id", "first_name", "last_name", "avatar")}
      ON CONFLICT (vk_id)
      DO UPDATE SET vk_id = ${params.vk_id}
      RETURNING *
   `;

    return user as User;
  }

  async getUser(id: string) {
    const [user] = await sql`
      SELECT
         *
      FROM
        users
      WHERE id = ${id}
   `;

    return user as User | null;
  }
}

export const userSvc = new UserService();
