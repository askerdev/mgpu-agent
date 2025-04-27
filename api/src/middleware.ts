import { getSignedCookie } from "hono/cookie";
import { Session, User } from "./postgres";
import { userSvc } from "./services/user";
import { Context, Next } from "hono";

export interface AuthEnv {
  Variables: {
    user: User;
  };
}
export const auth = () => {
  return async (c: Context<AuthEnv>, next: Next) => {
    const raw = await getSignedCookie(c, "supersecret", "session");

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

    const user = await userSvc.getUser(session.user_id);

    if (!user) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }

    c.set("user", user);

    await next();
  };
};
