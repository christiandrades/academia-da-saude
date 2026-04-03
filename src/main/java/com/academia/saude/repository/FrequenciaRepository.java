package com.academia.saude.repository;

import com.academia.saude.entity.Frequencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FrequenciaRepository extends JpaRepository<Frequencia, Long> {

    List<Frequencia> findByUsuarioId(Long usuarioId);

    @Query("""
            SELECT f.usuario.id FROM Frequencia f
            WHERE f.dataHora >= :desde
            GROUP BY f.usuario.id
            HAVING SUM(CASE WHEN f.statusPresenca = true THEN 1 ELSE 0 END) = 0
            """)
    List<Long> findIdsDeFaltosos(@Param("desde") LocalDateTime desde);
}