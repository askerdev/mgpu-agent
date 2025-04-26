BEGIN;

DROP INDEX IF EXISTS embeddings_embedding_idx;

DROP TABLE IF EXISTS
    embeddings,
    messages,
    chats,
    sessions,
    users;

DROP EXTENSION IF EXISTS "vector";
DROP EXTENSION IF EXISTS "uuid-ossp";

COMMIT;
