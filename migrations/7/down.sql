
DELETE FROM desafios;
DELETE FROM turmas WHERE nome LIKE 'GAF%' OR nome LIKE 'Hidro%' OR nome LIKE 'Yoga%' OR nome LIKE 'Caminhada%';
DELETE FROM badges WHERE slug IN ('primeira-aula', 'frequentador', 'persistente', 'dedicado', 'campeao', 'pontual', 'social', 'desafiador', 'veterano', 'motivador');
