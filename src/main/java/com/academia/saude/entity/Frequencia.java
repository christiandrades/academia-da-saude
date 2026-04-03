package com.academia.saude.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_frequencia", indexes = {
        @Index(name = "idx_frequencia_usuario_id", columnList = "usuario_id"),
        @Index(name = "idx_frequencia_data_hora", columnList = "data_hora")
})
public class Frequencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "status_presenca", nullable = false)
    private Boolean statusPresenca;

    public Frequencia() {}

    public Frequencia(Usuario usuario, Boolean statusPresenca) {
        this.usuario = usuario;
        this.statusPresenca = statusPresenca;
        this.dataHora = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public LocalDateTime getDataHora() { return dataHora; }
    public Boolean getStatusPresenca() { return statusPresenca; }

    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    public void setStatusPresenca(Boolean statusPresenca) { this.statusPresenca = statusPresenca; }
}