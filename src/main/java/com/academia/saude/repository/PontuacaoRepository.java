package com.academia.saude.repository;

import com.academia.saude.entity.Pontuacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repositório JPA para a entidade Pontuacao.
 */
public interface PontuacaoRepository extends JpaRepository<Pontuacao, Long> {

    // Retorna o histórico completo de lançamentos de pontos de um aluno
    List<Pontuacao> findByUsuarioId(Long usuarioId);

    /**
     * Soma todos os pontos acumulados por um aluno.
     *
     * COALESCE garante que o retorno seja 0 (e não null) quando o aluno
     * ainda não possui nenhum lançamento de pontuação.
     */
    @Query("SELECT COALESCE(SUM(p.pontos), 0) FROM Pontuacao p WHERE p.usuario.id = :usuarioId")
    Integer sumPontosByUsuarioId(@Param("usuarioId") Long usuarioId);
}
