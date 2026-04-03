package com.academia.saude.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Entidade que representa um lançamento de pontos no sistema de gamificação.
 *
 * Cada presença confirmada gera um registro aqui, funcionando como trilha de auditoria:
 * é possível rastrear exatamente quando e por qual motivo os pontos foram atribuídos.
 *
 * O total de pontos de um aluno é a soma de todos os registros desta tabela para ele.
 */
@Entity
@Table(name = "tb_pontuacao", indexes = {
        // Índice em usuario_id: acelera a soma de pontos por aluno
        @Index(name = "idx_pontuacao_usuario_id", columnList = "usuario_id")
})
public class Pontuacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @JsonIgnore previne referência circular na serialização JSON:
    // Pontuacao → Usuario → List<Pontuacao> → Pontuacao → ...
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Quantidade de pontos concedidos neste lançamento
    @Column(nullable = false)
    private Integer pontos;

    // Descrição do motivo da pontuação (ex.: "Presença registrada")
    // Garante rastreabilidade das regras de negócio
    @Column(nullable = false)
    private String motivo;

    // Momento exato do lançamento — permite auditoria cronológica
    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    // Construtor padrão exigido pelo JPA
    public Pontuacao() {}

    /**
     * Construtor de uso do serviço.
     * A dataHora é preenchida automaticamente com o momento atual.
     */
    public Pontuacao(Usuario usuario, Integer pontos, String motivo) {
        this.usuario = usuario;
        this.pontos = pontos;
        this.motivo = motivo;
        this.dataHora = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public Integer getPontos() { return pontos; }
    public String getMotivo() { return motivo; }
    public LocalDateTime getDataHora() { return dataHora; }

    // Setters
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public void setPontos(Integer pontos) { this.pontos = pontos; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
}
