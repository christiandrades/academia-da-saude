package com.academia.saude.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Entidade que representa um usuário cadastrado no sistema.
 *
 * Implementa UserDetails para integração direta com o Spring Security,
 * permitindo que o Spring use esta classe para autenticação e controle de acesso.
 *
 * Mapeada para a tabela "tb_usuarios" no banco de dados.
 */
@Entity
@Table(name = "tb_usuarios")
public class Usuario implements UserDetails {

    // Chave primária gerada automaticamente pelo banco (auto-increment)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nome completo do usuário — não pode ser vazio
    @NotBlank
    private String nome;

    // E-mail é o identificador único de login; deve ser válido e não repetido
    @Email
    @NotBlank
    @Column(unique = true)
    private String email;

    // Senha armazenada como hash BCrypt — nunca em texto puro
    @NotBlank
    private String senha;

    // Perfil do usuário: ALUNO ou SERVIDOR
    // EnumType.STRING salva o nome textual no banco ("ALUNO"), não o índice numérico
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Lista de presenças registradas para este usuário
    // cascade = ALL: ao excluir o usuário, suas frequências também são excluídas
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Frequencia> frequencias;

    // Lista de registros de pontuação vinculados a este usuário
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Pontuacao> pontuacoes;

    // Construtor padrão exigido pelo JPA
    public Usuario() {}

    public Usuario(String nome, String email, String senha, Role role) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.role = role;
    }

    /**
     * Retorna as permissões do usuário para o Spring Security.
     * O prefixo "ROLE_" é exigido pelo framework para funcionar com hasRole().
     * Ex.: SERVIDOR → "ROLE_SERVIDOR"
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    // O Spring Security usa getPassword() para comparar com a senha informada no login
    @Override
    public String getPassword() {
        return senha;
    }

    // O Spring Security usa getUsername() como identificador principal (aqui é o e-mail)
    @Override
    public String getUsername() {
        return email;
    }

    // Getters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenha() { return senha; }
    public Role getRole() { return role; }

    // Setters
    public void setNome(String nome) { this.nome = nome; }
    public void setEmail(String email) { this.email = email; }
    public void setSenha(String senha) { this.senha = senha; }
    public void setRole(Role role) { this.role = role; }
}
