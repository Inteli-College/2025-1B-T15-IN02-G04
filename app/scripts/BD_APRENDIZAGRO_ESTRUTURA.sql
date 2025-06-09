-- ========================================
-- SISTEMA EDUCACIONAL COMPLETO
-- Script para criar a estrutura completa do banco de dados
-- Baseado nos arquivos Parte1BD.sql e Parte2BD.sql
-- ========================================

-- ========================================
-- CRIAR TABELAS PRINCIPAIS - CORE SYSTEM
-- ========================================

-- Tabela principal de usuários
CREATE TABLE IF NOT EXISTS "user" (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  birth_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de papéis/roles
CREATE TABLE IF NOT EXISTS role (
  id BIGSERIAL PRIMARY KEY,
  role_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de associação usuário-papel
CREATE TABLE IF NOT EXISTS role_user (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL,
  id_role BIGINT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (id_role) REFERENCES role(id) ON DELETE CASCADE,
  UNIQUE(id_user, id_role)
);

-- ========================================
-- SISTEMA EDUCACIONAL - TRILHAS E CONTEÚDO
-- ========================================

-- Tabela de trilhas educacionais
CREATE TABLE IF NOT EXISTS trail (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de módulos dentro das trilhas
CREATE TABLE IF NOT EXISTS module (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  id_trail BIGINT NOT NULL,
  module_order INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_trail) REFERENCES trail(id) ON DELETE CASCADE
);

-- Tabela de aulas dentro dos módulos
CREATE TABLE IF NOT EXISTS class (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  id_module BIGINT NOT NULL,
  class_order INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_module) REFERENCES module(id) ON DELETE CASCADE
);

-- ========================================
-- SISTEMA DE CERTIFICADOS E MÉRITOS
-- ========================================

-- Tabela de certificados
CREATE TABLE IF NOT EXISTS certificate (
  id BIGSERIAL PRIMARY KEY,
  description TEXT,
  date DATE NOT NULL,
  id_user BIGINT NOT NULL,
  id_trail BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (id_trail) REFERENCES trail(id) ON DELETE CASCADE
);

-- Tabela de méritos/conquistas
CREATE TABLE IF NOT EXISTS merit (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de méritos dos usuários
CREATE TABLE IF NOT EXISTS merit_user (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL,
  id_merit BIGINT NOT NULL,
  awarded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (id_merit) REFERENCES merit(id) ON DELETE CASCADE,
  UNIQUE(id_user, id_merit)
);

-- ========================================
-- SISTEMA DE AVALIAÇÕES E TESTES
-- ========================================

-- Tabela de testes
CREATE TABLE IF NOT EXISTS test (
  id BIGSERIAL PRIMARY KEY,
  id_trail BIGINT NOT NULL,
  name VARCHAR(255),
  description TEXT,
  max_attempts INTEGER DEFAULT 3,
  passing_grade INTEGER DEFAULT 70,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_trail) REFERENCES trail(id) ON DELETE CASCADE
);

-- Tabela de perguntas dos testes
CREATE TABLE IF NOT EXISTS question (
  id BIGSERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  id_test BIGINT NOT NULL,
  question_order INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_test) REFERENCES test(id) ON DELETE CASCADE
);

-- Tabela de respostas das perguntas
CREATE TABLE IF NOT EXISTS answer (
  id BIGSERIAL PRIMARY KEY,
  answer_text TEXT NOT NULL,
  correct BOOLEAN NOT NULL DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  id_question BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_question) REFERENCES question(id) ON DELETE CASCADE
);

-- ========================================
-- SISTEMA DE PROGRESSO DO USUÁRIO
-- ========================================

-- Progresso dos usuários nas trilhas
CREATE TABLE IF NOT EXISTS trail_user (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL,
  id_trail BIGINT NOT NULL,
  percentage INTEGER DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (id_trail) REFERENCES trail(id) ON DELETE CASCADE,
  UNIQUE(id_user, id_trail)
);

-- Progresso dos usuários nos módulos
CREATE TABLE IF NOT EXISTS module_user (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL,
  id_module BIGINT NOT NULL,
  percentage INTEGER DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (id_module) REFERENCES module(id) ON DELETE CASCADE,
  UNIQUE(id_user, id_module)
);

-- Progresso dos usuários nas aulas
CREATE TABLE IF NOT EXISTS class_user (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL,
  id_class BIGINT NOT NULL,
  complete BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (id_class) REFERENCES class(id) ON DELETE CASCADE,
  UNIQUE(id_user, id_class)
);

-- Resultados dos testes dos usuários
CREATE TABLE IF NOT EXISTS test_user (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL,
  id_test BIGINT NOT NULL,
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attempt_number INTEGER DEFAULT 1,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (id_test) REFERENCES test(id) ON DELETE CASCADE
);

-- ========================================
-- SISTEMA SOCIAL - POSTS E INTERAÇÕES
-- ========================================

-- Tabela de posts/publicações
CREATE TABLE IF NOT EXISTS post (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comment (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Comentários em posts
CREATE TABLE IF NOT EXISTS comment_post (
  id BIGSERIAL PRIMARY KEY,
  id_post BIGINT NOT NULL,
  id_comment BIGINT NOT NULL,
  FOREIGN KEY (id_post) REFERENCES post(id) ON DELETE CASCADE,
  FOREIGN KEY (id_comment) REFERENCES comment(id) ON DELETE CASCADE,
  UNIQUE(id_post, id_comment)
);

-- Comentários em aulas
CREATE TABLE IF NOT EXISTS comment_class (
  id BIGSERIAL PRIMARY KEY,
  id_class BIGINT NOT NULL,
  id_comment BIGINT NOT NULL,
  FOREIGN KEY (id_class) REFERENCES class(id) ON DELETE CASCADE,
  FOREIGN KEY (id_comment) REFERENCES comment(id) ON DELETE CASCADE,
  UNIQUE(id_class, id_comment)
);

-- Curtidas dos usuários em posts
CREATE TABLE IF NOT EXISTS user_like (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL,
  id_post BIGINT NOT NULL,
  liked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (id_post) REFERENCES post(id) ON DELETE CASCADE,
  UNIQUE(id_user, id_post)
);

-- ========================================
-- SISTEMA DE GAMIFICAÇÃO
-- ========================================

-- Tabela de cards/cartões colecionáveis
CREATE TABLE IF NOT EXISTS card (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(255) NOT NULL,
  rarity VARCHAR(50) DEFAULT 'common', -- common, rare, epic, legendary
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards dos usuários
CREATE TABLE IF NOT EXISTS card_user (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL,
  id_card BIGINT NOT NULL,
  obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (id_card) REFERENCES card(id) ON DELETE CASCADE,
  UNIQUE(id_user, id_card)
);

-- Sistema de ranking
CREATE TABLE IF NOT EXISTS ranking (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL UNIQUE,
  position INTEGER,
  score INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE
);

-- ========================================
-- SISTEMA DE HIERARQUIA
-- ========================================

-- Hierarquia entre usuários (mentor/aprendiz, etc.)
CREATE TABLE IF NOT EXISTS hierarchy (
  id BIGSERIAL PRIMARY KEY,
  id_role_user1 BIGINT NOT NULL, -- Usuário superior na hierarquia
  id_role_user2 BIGINT NOT NULL, -- Usuário subordinado na hierarquia
  hierarchy_type VARCHAR(50) DEFAULT 'mentor', -- mentor, supervisor, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_role_user1) REFERENCES role_user(id) ON DELETE CASCADE,
  FOREIGN KEY (id_role_user2) REFERENCES role_user(id) ON DELETE CASCADE
);

-- Hierarquia específica para trilhas
CREATE TABLE IF NOT EXISTS hierarchy_trail (
  id BIGSERIAL PRIMARY KEY,
  id_hierarchy BIGINT NOT NULL,
  id_trail BIGINT NOT NULL,
  permissions TEXT, -- JSON ou texto com permissões específicas
  FOREIGN KEY (id_hierarchy) REFERENCES hierarchy(id) ON DELETE CASCADE,
  FOREIGN KEY (id_trail) REFERENCES trail(id) ON DELETE CASCADE,
  UNIQUE(id_hierarchy, id_trail)
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para tabelas de usuários e roles
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_role_user_user_id ON role_user(id_user);
CREATE INDEX IF NOT EXISTS idx_role_user_role_id ON role_user(id_role);

-- Índices para sistema educacional
CREATE INDEX IF NOT EXISTS idx_module_trail_id ON module(id_trail);
CREATE INDEX IF NOT EXISTS idx_class_module_id ON class(id_module);
CREATE INDEX IF NOT EXISTS idx_test_trail_id ON test(id_trail);
CREATE INDEX IF NOT EXISTS idx_question_test_id ON question(id_test);
CREATE INDEX IF NOT EXISTS idx_answer_question_id ON answer(id_question);

-- Índices para progresso do usuário
CREATE INDEX IF NOT EXISTS idx_trail_user_user_id ON trail_user(id_user);
CREATE INDEX IF NOT EXISTS idx_trail_user_trail_id ON trail_user(id_trail);
CREATE INDEX IF NOT EXISTS idx_module_user_user_id ON module_user(id_user);
CREATE INDEX IF NOT EXISTS idx_module_user_module_id ON module_user(id_module);
CREATE INDEX IF NOT EXISTS idx_class_user_user_id ON class_user(id_user);
CREATE INDEX IF NOT EXISTS idx_class_user_class_id ON class_user(id_class);
CREATE INDEX IF NOT EXISTS idx_test_user_user_id ON test_user(id_user);
CREATE INDEX IF NOT EXISTS idx_test_user_test_id ON test_user(id_test);

-- Índices para sistema social
CREATE INDEX IF NOT EXISTS idx_post_user_id ON post(id_user);
CREATE INDEX IF NOT EXISTS idx_post_created_at ON post(created_at);
CREATE INDEX IF NOT EXISTS idx_comment_user_id ON comment(id_user);
CREATE INDEX IF NOT EXISTS idx_user_like_user_id ON user_like(id_user);
CREATE INDEX IF NOT EXISTS idx_user_like_post_id ON user_like(id_post);

-- Índices para gamificação
CREATE INDEX IF NOT EXISTS idx_ranking_score ON ranking(score DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_position ON ranking(position);
CREATE INDEX IF NOT EXISTS idx_card_user_user_id ON card_user(id_user);

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View para progresso completo dos usuários
CREATE OR REPLACE VIEW v_user_progress AS
SELECT 
  u.id as user_id,
  u.first_name,
  u.last_name,
  u.email,
  t.id as trail_id,
  t.name as trail_name,
  tu.percentage as trail_progress,
  tu.started_at as trail_started,
  tu.completed_at as trail_completed,
  COUNT(DISTINCT m.id) as total_modules,
  COUNT(DISTINCT mu.id) as completed_modules,
  COUNT(DISTINCT c.id) as total_classes,
  COUNT(DISTINCT cu.id) as completed_classes
FROM "user" u
LEFT JOIN trail_user tu ON u.id = tu.id_user
LEFT JOIN trail t ON tu.id_trail = t.id
LEFT JOIN module m ON t.id = m.id_trail
LEFT JOIN module_user mu ON u.id = mu.id_user AND m.id = mu.id_module AND mu.percentage = 100
LEFT JOIN class c ON m.id = c.id_module
LEFT JOIN class_user cu ON u.id = cu.id_user AND c.id = cu.id_class AND cu.complete = TRUE
GROUP BY u.id, u.first_name, u.last_name, u.email, t.id, t.name, tu.percentage, tu.started_at, tu.completed_at;

-- View para ranking com detalhes dos usuários
CREATE OR REPLACE VIEW v_ranking_detailed AS
SELECT 
  r.position,
  r.score,
  u.id as user_id,
  u.first_name,
  u.last_name,
  u.username,
  u.avatar,
  COUNT(DISTINCT mu.id) as merits_earned,
  COUNT(DISTINCT c.id) as certificates_earned,
  r.last_updated
FROM ranking r
JOIN "user" u ON r.id_user = u.id
LEFT JOIN merit_user mu ON u.id = mu.id_user
LEFT JOIN certificate c ON u.id = c.id_user
GROUP BY r.position, r.score, u.id, u.first_name, u.last_name, u.username, u.avatar, r.last_updated
ORDER BY r.position;

-- View para posts com interações
CREATE OR REPLACE VIEW v_posts_with_interactions AS
SELECT 
  p.id as post_id,
  p.title,
  p.description,
  p.image,
  p.created_at,
  u.first_name as author_first_name,
  u.last_name as author_last_name,
  u.username as author_username,
  COUNT(DISTINCT ul.id) as total_likes,
  COUNT(DISTINCT cp.id) as total_comments
FROM post p
JOIN "user" u ON p.id_user = u.id
LEFT JOIN user_like ul ON p.id = ul.id_post AND ul.liked = TRUE
LEFT JOIN comment_post cp ON p.id = cp.id_post
GROUP BY p.id, p.title, p.description, p.image, p.created_at, u.first_name, u.last_name, u.username
ORDER BY p.created_at DESC;

-- ========================================
-- FUNÇÕES UTILITÁRIAS
-- ========================================

-- Função para calcular o progresso de uma trilha
CREATE OR REPLACE FUNCTION calculate_trail_progress(
  p_user_id BIGINT,
  p_trail_id BIGINT
) RETURNS INTEGER AS $$
DECLARE
  v_total_classes INTEGER;
  v_completed_classes INTEGER;
  v_progress INTEGER;
BEGIN
  -- Contar total de aulas na trilha
  SELECT COUNT(c.id) INTO v_total_classes
  FROM class c
  JOIN module m ON c.id_module = m.id
  WHERE m.id_trail = p_trail_id;
  
  -- Contar aulas completadas pelo usuário
  SELECT COUNT(cu.id) INTO v_completed_classes
  FROM class_user cu
  JOIN class c ON cu.id_class = c.id
  JOIN module m ON c.id_module = m.id
  WHERE cu.id_user = p_user_id 
    AND m.id_trail = p_trail_id 
    AND cu.complete = TRUE;
  
  -- Calcular progresso
  IF v_total_classes = 0 THEN
    v_progress := 0;
  ELSE
    v_progress := ROUND((v_completed_classes::DECIMAL / v_total_classes::DECIMAL) * 100);
  END IF;
  
  -- Atualizar tabela trail_user
  UPDATE trail_user 
  SET percentage = v_progress,
      completed_at = CASE WHEN v_progress = 100 THEN CURRENT_TIMESTAMP ELSE NULL END
  WHERE id_user = p_user_id AND id_trail = p_trail_id;
  
  RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar ranking
CREATE OR REPLACE FUNCTION update_user_ranking(p_user_id BIGINT) RETURNS VOID AS $$
DECLARE
  v_score INTEGER := 0;
BEGIN
  -- Calcular pontuação baseada em:
  -- Trilhas completadas (100 pontos cada)
  -- Módulos completados (25 pontos cada)
  -- Aulas completadas (5 pontos cada)
  -- Testes aprovados (50 pontos cada)
  -- Méritos conquistados (30 pontos cada)
  
  SELECT 
    (COUNT(DISTINCT tu.id) * 100) + -- Trilhas completas
    (COUNT(DISTINCT mu.id) * 25) + -- Módulos completos
    (COUNT(DISTINCT cu.id) * 5) + -- Aulas completas
    (COUNT(DISTINCT tst.id) * 50) + -- Testes aprovados
    (COUNT(DISTINCT mrt.id) * 30) -- Méritos
  INTO v_score
  FROM "user" u
  LEFT JOIN trail_user tu ON u.id = tu.id_user AND tu.percentage = 100
  LEFT JOIN module_user mu ON u.id = mu.id_user AND mu.percentage = 100
  LEFT JOIN class_user cu ON u.id = cu.id_user AND cu.complete = TRUE
  LEFT JOIN test_user tst ON u.id = tst.id_user AND tst.grade >= 70
  LEFT JOIN merit_user mrt ON u.id = mrt.id_user
  WHERE u.id = p_user_id;
  
  -- Inserir ou atualizar ranking
  INSERT INTO ranking (id_user, score, last_updated)
  VALUES (p_user_id, v_score, CURRENT_TIMESTAMP)
  ON CONFLICT (id_user) DO UPDATE SET
    score = EXCLUDED.score,
    last_updated = EXCLUDED.last_updated;
    
  -- Atualizar posições
  WITH ranked_users AS (
    SELECT id_user, ROW_NUMBER() OVER (ORDER BY score DESC, last_updated ASC) as new_position
    FROM ranking
  )
  UPDATE ranking 
  SET position = ru.new_position
  FROM ranked_users ru
  WHERE ranking.id_user = ru.id_user;
  
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se usuário pode acessar trilha
CREATE OR REPLACE FUNCTION can_access_trail(
  p_user_id BIGINT,
  p_trail_id BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN := FALSE;
BEGIN
  -- Verificar se usuário tem acesso direto ou através de hierarquia
  SELECT EXISTS(
    SELECT 1 FROM trail_user tu WHERE tu.id_user = p_user_id AND tu.id_trail = p_trail_id
    UNION
    SELECT 1 FROM hierarchy_trail ht
    JOIN hierarchy h ON ht.id_hierarchy = h.id
    JOIN role_user ru ON h.id_role_user1 = ru.id
    WHERE ru.id_user = p_user_id AND ht.id_trail = p_trail_id
  ) INTO v_has_access;
  
  RETURN v_has_access;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS PARA ATUALIZAÇÕES AUTOMÁTICAS
-- ========================================

-- Trigger para atualizar progresso ao completar aula
CREATE OR REPLACE FUNCTION trigger_update_progress() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.complete = TRUE AND (OLD.complete IS NULL OR OLD.complete = FALSE) THEN
    -- Atualizar progresso do módulo
    PERFORM calculate_trail_progress(NEW.id_user, 
      (SELECT m.id_trail FROM module m 
       JOIN class c ON m.id = c.id_module 
       WHERE c.id = NEW.id_class));
    
    -- Atualizar ranking
    PERFORM update_user_ranking(NEW.id_user);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_class_user_update
  AFTER UPDATE ON class_user
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_progress();

-- ========================================
-- INSERIR DADOS BÁSICOS
-- ========================================

-- Inserir roles básicos
INSERT INTO role (role_name, description) VALUES
('admin', 'Administrador do sistema'),
('instructor', 'Instrutor de trilhas'),
('student', 'Estudante'),
('mentor', 'Mentor de outros usuários')
ON CONFLICT (role_name) DO NOTHING;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

SELECT 'SISTEMA EDUCACIONAL COMPLETO CRIADO COM SUCESSO!' as resultado;

-- Verificar se as tabelas foram criadas
SELECT 
  'Tabelas criadas:' as info,
  COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user', 'role', 'role_user', 'trail', 'module', 'class', 
    'certificate', 'merit', 'merit_user', 'test', 'question', 
    'answer', 'trail_user', 'module_user', 'class_user', 'test_user',
    'post', 'comment', 'comment_post', 'comment_class', 'user_like',
    'card', 'card_user', 'ranking', 'hierarchy', 'hierarchy_trail'
  );

-- Verificar se as funções foram criadas
SELECT 
  'Funções criadas:' as info,
  COUNT(*) as total_funcoes
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'calculate_trail_progress', 'update_user_ranking', 'can_access_trail'
  );