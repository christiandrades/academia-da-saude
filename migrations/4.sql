
-- Criar tabela de desafios
CREATE TABLE desafios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('FREQUENCIA', 'SEQUENCIA', 'ATIVIDADE')),
  meta_valor INTEGER NOT NULL,
  meta_periodo TEXT NOT NULL CHECK (meta_periodo IN ('DIARIO', 'SEMANAL', 'MENSAL')),
  badge_id INTEGER,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  is_ativo BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de progresso dos desafios
CREATE TABLE desafio_progresso (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  desafio_id INTEGER NOT NULL,
  progresso_atual INTEGER DEFAULT 0,
  is_concluido BOOLEAN DEFAULT 0,
  data_conclusao TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
