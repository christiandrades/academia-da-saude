
-- Inserir desafios de exemplo
INSERT INTO desafios (titulo, descricao, tipo, meta_valor, meta_periodo, data_inicio, data_fim) VALUES
('Primeira Semana', 'Complete 5 aulas na sua primeira semana', 'FREQUENCIA', 5, 'SEMANAL', '2024-09-01', '2024-12-31'),
('Sequência de Fogo', 'Vá 7 dias consecutivos sem faltar', 'SEQUENCIA', 7, 'SEMANAL', '2024-09-01', '2024-12-31'),
('Mês Perfeito', 'Alcance 100% de frequência no mês', 'FREQUENCIA', 100, 'MENSAL', '2024-09-01', '2024-12-31'),
('Dedicação Total', 'Participe de 20 aulas no mês', 'FREQUENCIA', 20, 'MENSAL', '2024-09-01', '2024-12-31'),
('Maratonista', 'Complete 10 dias consecutivos', 'SEQUENCIA', 10, 'SEMANAL', '2024-09-01', '2024-12-31');

-- Inserir dados de exemplo para demonstração
-- Criar algumas aulas de exemplo
INSERT INTO aulas (turma_id, data, tema_opcional) VALUES
(1, '2024-09-02', 'Alongamento Matinal'),
(1, '2024-09-03', 'Fortalecimento Core'),
(1, '2024-09-04', 'Cardio Funcional'),
(1, '2024-09-05', 'Flexibilidade'),
(1, '2024-09-06', 'Exercícios Posturais'),
(2, '2024-09-02', 'Aquecimento e Mobilidade'),
(2, '2024-09-03', 'Resistência Muscular'),
(2, '2024-09-04', 'Coordenação Motora'),
(2, '2024-09-05', 'Relaxamento'),
(2, '2024-09-06', 'Fortalecimento Geral');
