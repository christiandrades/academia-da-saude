
-- Inserir badges padrão do sistema
INSERT OR IGNORE INTO badges (slug, titulo, descricao, cor, icone) VALUES
('primeira-aula', 'Primeira Aula', 'Completou sua primeira aula na Academia da Saúde', '#B1E001', 'star'),
('frequentador', 'Frequentador', 'Manteve 80% de frequência por um mês', '#CEF09D', 'calendar-check'),
('persistente', 'Persistente', 'Frequentou por 3 meses consecutivos', '#B8ECD7', 'trending-up'),
('dedicado', 'Dedicado', 'Completou 50 aulas', '#476C5E', 'award'),
('campeao', 'Campeão', 'Ficou em 1º lugar no ranking mensal', '#083643', 'crown'),
('pontual', 'Pontual', 'Não faltou nenhuma aula no mês', '#B1E001', 'clock'),
('social', 'Social', 'Participou de atividades em grupo', '#CEF09D', 'users'),
('desafiador', 'Desafiador', 'Completou 10 desafios', '#B8ECD7', 'target'),
('veterano', 'Veterano', 'Completou 1 ano na Academia da Saúde', '#476C5E', 'shield'),
('motivador', 'Motivador', 'Ajudou outros alunos a melhorarem', '#083643', 'heart');

-- Inserir turmas de exemplo
INSERT OR IGNORE INTO turmas (nome, horario, instrutor, local) VALUES
('GAF 01 - Manhã', '08:00 - 09:30', 'Prof. Maria Silva', 'Polo Academia da Saúde - Centro'),
('GAF 02 - Tarde', '14:00 - 15:30', 'Prof. João Santos', 'Polo Academia da Saúde - Centro'),
('GAF 03 - Noite', '18:00 - 19:30', 'Prof. Ana Costa', 'Polo Academia da Saúde - Centro'),
('Hidroginástica', '09:00 - 10:00', 'Prof. Pedro Lima', 'Piscina Municipal'),
('Yoga para Idosos', '15:00 - 16:00', 'Prof. Carla Souza', 'Centro Comunitário'),
('Caminhada Orientada', '06:00 - 07:00', 'Prof. Ricardo Oliveira', 'Parque da Cidade');

-- Inserir desafios padrão
INSERT OR IGNORE INTO desafios (titulo, descricao, tipo, meta_valor, meta_periodo, badge_id, data_inicio, data_fim, is_ativo) VALUES
('Frequência Perfeita', 'Não falte nenhuma aula por uma semana', 'FREQUENCIA', 7, 'SEMANAL', 
 (SELECT id FROM badges WHERE slug = 'pontual'), date('now'), date('now', '+30 days'), 1),
('Mestre da Consistência', 'Mantenha 90% de frequência por um mês', 'FREQUENCIA', 90, 'MENSAL',
 (SELECT id FROM badges WHERE slug = 'frequentador'), date('now'), date('now', '+30 days'), 1),
('Sequência de Ouro', 'Complete 10 aulas consecutivas', 'SEQUENCIA', 10, 'DIARIO',
 (SELECT id FROM badges WHERE slug = 'persistente'), date('now'), date('now', '+30 days'), 1),
('Desafio dos 30 Dias', 'Participe de 20 aulas em 30 dias', 'ATIVIDADE', 20, 'MENSAL',
 (SELECT id FROM badges WHERE slug = 'dedicado'), date('now'), date('now', '+30 days'), 1);
