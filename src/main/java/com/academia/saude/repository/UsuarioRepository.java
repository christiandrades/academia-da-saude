package com.academia.saude.repository;

import com.academia.saude.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositório JPA para a entidade Usuario.
 *
 * O Spring Data JPA gera automaticamente as implementações dos métodos
 * com base no nome deles — não é necessário escrever SQL manualmente.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Busca um usuário pelo e-mail; usado no login e na autenticação JWT
    Optional<Usuario> findByEmail(String email);

    // Verifica se já existe um cadastro com este e-mail; usado para evitar duplicatas
    boolean existsByEmail(String email);
}
