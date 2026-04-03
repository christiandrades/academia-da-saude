package com.academia.saude.repository;

import com.academia.saude.entity.Pontuacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PontuacaoRepository extends JpaRepository<Pontuacao, Long> {

    List<Pontuacao> findByUsuarioId(Long usuarioId);

    @Query("SELECT COALESCE(SUM(p.pontos), 0) FROM Pontuacao p WHERE p.usuario.id = :usuarioId")
    Integer sumPontosByUsuarioId(@Param("usuarioId") Long usuarioId);
}