package com.academia.saude.repository;

import com.academia.saude.entity.Frequencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositório JPA para a entidade Frequencia.
 *
 * Contém a query customizada responsável por alimentar o dashboard de faltosos,
 * que é o coração do CRM de resgate ativo desta aplicação.
 */
public interface FrequenciaRepository extends JpaRepository<Frequencia, Long> {

    // Retorna todas as frequências de um aluno específico, ordenadas pelo JPA por id
    List<Frequencia> findByUsuarioId(Long usuarioId);

    /**
     * Identifica alunos que NÃO tiveram nenhuma presença confirmada no período informado.
     *
     * Lógica da query JPQL:
     * 1. Filtra os registros a partir da data "desde" (ex.: últimos 30 dias)
     * 2. Agrupa por usuario_id para analisar cada aluno individualmente
     * 3. A cláusula HAVING mantém apenas os grupos onde a SOMA de presenças = 0
     *    (ou seja, todos os registros do aluno no período têm statusPresenca = false)
     * 4. Retorna apenas os IDs para evitar joins desnecessários — o service carrega os usuários depois
     */
    @Query("""
            SELECT f.usuario.id FROM Frequencia f
            WHERE f.dataHora >= :desde
            GROUP BY f.usuario.id
            HAVING SUM(CASE WHEN f.statusPresenca = true THEN 1 ELSE 0 END) = 0
            """)
    List<Long> findIdsDeFaltosos(@Param("desde") LocalDateTime desde);
}
