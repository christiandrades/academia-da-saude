
-- Inserir turmas de exemplo
INSERT INTO turmas (nome, horario, instrutor, local) VALUES
('GAF 01', '14:00 - 15:00', 'Prof. Maria Silva', 'Quadra Poliesportiva'),
('GAF 60+', '08:00 - 09:00', 'Prof. João Santos', 'Espaço Verde'),
('GAF Hipertensos', '16:00 - 17:00', 'Prof. Ana Costa', 'Sala de Atividades');

-- Inserir badges de exemplo
INSERT INTO badges (slug, titulo, descricao, cor, icone) VALUES
('primeiro-dia', 'Primeiro Dia', 'Bem-vindo à Academia da Saúde!', '#B1E001', '🌟'),
('selo-verde', 'Selo Verde', 'Presença igual ou superior a 95%', '#B1E001', '🟢'),
('selo-prata', 'Selo Prata', 'Presença entre 75% e 94%', '#C0C0C0', '🥈'),
('pontualidade', 'Pontualidade', 'Chegou no horário por 5 dias seguidos', '#B8ECD7', '⏰'),
('retorno-campeao', 'Retorno Campeão', 'Voltou após 2 semanas de ausência', '#CEF09D', '🏆'),
('constancia', 'Constância', '30 dias sem faltar', '#476C5E', '💪');

-- Inserir aulas do mês atual para demonstração
INSERT INTO aulas (turma_id, data, tema_opcional) VALUES
(1, date('now', '-7 days'), 'Alongamento e Aquecimento'),
(1, date('now', '-6 days'), 'Fortalecimento'),
(1, date('now', '-5 days'), 'Caminhada em Grupo'),
(1, date('now', '-4 days'), 'Exercícios Funcionais'),
(1, date('now', '-3 days'), 'Relaxamento e Respiração'),
(1, date('now', '-2 days'), 'Circuito de Exercícios'),
(1, date('now', '-1 days'), 'Dança e Movimento'),
(1, date('now'), 'Avaliação e Alongamento'),
(2, date('now', '-7 days'), 'Caminhada Leve'),
(2, date('now', '-6 days'), 'Exercícios Sentados'),
(2, date('now', '-5 days'), 'Hidroginástica Adaptada'),
(2, date('now', '-4 days'), 'Tai Chi'),
(2, date('now', '-3 days'), 'Jogos Recreativos'),
(2, date('now', '-2 days'), 'Exercícios de Equilíbrio'),
(2, date('now', '-1 days'), 'Alongamento Suave'),
(2, date('now'), 'Meditação e Relaxamento');
