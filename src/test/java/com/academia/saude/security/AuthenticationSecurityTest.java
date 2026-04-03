package com.academia.saude.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de segurança para o fluxo de autenticação.
 *
 * Vetores de ataque cobertos:
 * - SQL Injection no campo e-mail e senha
 * - Cross-Site Scripting (XSS) no campo e-mail
 * - Campos em branco / ausentes
 * - Credenciais inválidas
 * - Enumeração de usuários (user enumeration)
 */
@DisplayName("Segurança — Autenticação")
class AuthenticationSecurityTest extends SecurityTestBase {

    @Test
    @DisplayName("Login com credenciais válidas deve retornar token JWT e role")
    void loginValido_deveRetornarTokenERole() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"aluno@test.com","senha":"Senha@123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ALUNO"));
    }

    @Test
    @DisplayName("SQL Injection no campo e-mail deve retornar 400 (falha na validação @Email)")
    void sqlInjectionNoEmail_deveRetornar400() throws Exception {
        // Mesmo que @Email não bloqueasse, JPA usa queries parametrizadas — imune a SQL Injection
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"' OR '1'='1' --","senha":"qualquer"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("SQL Injection na senha não deve causar erro 500 (BCrypt compara hash, não executa SQL)")
    void sqlInjectionNaSenha_deveRetornar401ENao500() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"aluno@test.com","senha":"' OR '1'='1"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus()).isLessThan(500));
    }

    @Test
    @DisplayName("XSS no campo e-mail deve retornar 400 (falha na validação @Email)")
    void xssNoEmail_deveRetornar400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"<script>alert(document.cookie)</script>@evil.com","senha":"senha"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("E-mail em branco deve retornar 400 (falha em @NotBlank)")
    void emailEmBranco_deveRetornar400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"","senha":"Senha@123"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Senha em branco deve retornar 400 (falha em @NotBlank)")
    void senhaEmBranco_deveRetornar400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"aluno@test.com","senha":""}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Usuário inexistente deve retornar 401 — não 404, para não revelar que o e-mail não existe")
    void usuarioInexistente_deveRetornar401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"naoexiste@test.com","senha":"Senha@123"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Senha errada deve retornar 401")
    void senhaErrada_deveRetornar401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"aluno@test.com","senha":"SenhaErrada!"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Respostas de 'usuário inexistente' e 'senha errada' devem ser idênticas — previne enumeração de usuários")
    void respostasDeErroDevemSerGenericas_prevenindoEnumeracaoDeUsuarios() throws Exception {
        String respostaUsuarioInexistente = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"naoexiste@test.com","senha":"Senha@123"}
                                """))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        String respostaSenhaErrada = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"aluno@test.com","senha":"SenhaErrada!"}
                                """))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        // Ambas as respostas devem ser idênticas — um atacante não consegue distinguir os casos
        assertThat(respostaUsuarioInexistente).isEqualTo(respostaSenhaErrada);
    }
}
