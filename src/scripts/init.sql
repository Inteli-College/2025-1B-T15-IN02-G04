CREATE TABLE IF NOT EXISTS Usuario (
  id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  hash_senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('PTD', 'Consultor')),
  score INTEGER DEFAULT 0 
);
