package com.academia.saude.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_pontuacao", indexes = {
        @Index(name = "idx_pontuacao_usuario_id", columnList = "usuario_id")
})
public class Pontuacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private Integer pontos;

    @Column(nullable = false)
    private String motivo;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    public Pontuacao() {}

    public Pontuacao(Usuario usuario, Integer pontos, String motivo) {
        this.usuario = usuario;
        this.pontos = pontos;
        this.motivo = motivo;
        this.dataHora = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public Integer getPontos() { return pontos; }
    public String getMotivo() { return motivo; }
    public LocalDateTime getDataHora() { return dataHora; }

    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public void setPontos(Integer pontos) { this.pontos = pontos; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
}