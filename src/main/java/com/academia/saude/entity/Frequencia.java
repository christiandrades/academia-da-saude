package com.academia.saude.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Entidade que representa um registro de presença (ou ausência) de um aluno.
 *
 * Cada linha nesta tabela corresponde a uma chamada feita pelo servidor.
 * O campo statusPresenca indica se o aluno estava presente (true) ou ausente (false).
 *
 * Índices criados para otimizar as consultas do dashboard de faltosos,
 * que filtra por usuario_id e data_hora com frequência.
 */
@Entity
@Table(name = "tb_frequencia", indexes = {
        // Índice em usuario_id: acelera busca de todas as presenças de um aluno
        @Index(name = "idx_frequencia_usuario_id", columnList = "usuario_id"),
        // Índice em data_hora: acelera filtros por período (ex.: últimos 30 dias)
        @Index(name = "idx_frequencia_data_hora", columnList = "data_hora")
})
public class Frequencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamento com o usuário dono deste registro
    // FetchType.LAZY: o usuário só é carregado do banco quando acessado explicitamente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Data e hora exata do registro de presença
    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    // true = presente | false = ausente
    @Column(name = "status_presenca", nullable = false)
    private Boolean statusPresenca;

    // Construtor padrão exigido pelo JPA
    public Frequencia() {}

    /**
     * Construtor de uso do serviço.
     * A dataHora é preenchida automaticamente com o momento atual.
     */
    public Frequencia(Usuario usuario, Boolean statusPresenca) {
        this.usuario = usuario;
        this.statusPresenca = statusPresenca;
        this.dataHora = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public LocalDateTime getDataHora() { return dataHora; }
    public Boolean getStatusPresenca() { return statusPresenca; }

    // Setters
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    public void setStatusPresenca(Boolean statusPresenca) { this.statusPresenca = statusPresenca; }
}
