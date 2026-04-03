
-- Adicionar dados de exemplo para turmas
INSERT INTO turmas (nome, horario, instrutor, local) VALUES 
('GAF 01 - Manhã', '08:00 - 09:30', 'Prof. Maria Silva', 'Polo Academia da Saúde'),
('GAF 02 - Tarde', '14:00 - 15:30', 'Prof. João Santos', 'Polo Academia da Saúde'),
('GAF 03 - Noite', '18:00 - 19:30', 'Prof. Ana Costa', 'Polo Academia da Saúde'),
('Hidroginástica', '07:00 - 08:00', 'Prof. Carlos Lima', 'Piscina Municipal'),
('Pilates', '16:00 - 17:00', 'Prof. Lucia Ferreira', 'Sala de Pilates');

-- Adicionar aulas de exemplo para este mês
INSERT INTO aulas (turma_id, data, tema_opcional) VALUES
(1, '2024-09-02', 'Alongamento e Aquecimento'),
(1, '2024-09-04', 'Exercícios Cardiovasculares'),
(1, '2024-09-06', 'Fortalecimento Muscular'),
(1, '2024-09-09', 'Coordenação e Equilíbrio'),
(2, '2024-09-02', 'Caminhada Orientada'),
(2, '2024-09-04', 'Exercícios Funcionais'),
(2, '2024-09-06', 'Relaxamento e Meditação'),
(2, '2024-09-09', 'Atividades em Grupo'),
(3, '2024-09-03', 'Mobilidade e Flexibilidade'),
(3, '2024-09-05', 'Exercícios Respiratórios'),
(3, '2024-09-09', 'Dinâmicas de Grupo');

-- Adicionar frequências de exemplo
INSERT INTO frequencias (user_id, aula_id, status, fonte) VALUES
(1, 1, 'PRESENTE', 'MANUAL'),
(1, 2, 'PRESENTE', 'MANUAL'),
(1, 3, 'ATRASO', 'MANUAL'),
(1, 4, 'PRESENTE', 'MANUAL');
