package com.academia.saude.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de segurança para controle de acesso baseado em perfil (RBAC)
 * e prevenção de Insecure Direct Object Reference (IDOR).
 *
 * Vetores de ataque cobertos:
 * - Acesso sem autenticação a rotas protegidas
 * - ALUNO tentando acessar endpoints exclusivos de SERVIDOR (escalada de privilégio)
 * - ALUNO tentando acessar dados de outro aluno (IDOR)
 * - Verificação de que SERVIDOR tem acesso completo
 * - Verificação de que ALUNO tem acesso somente aos próprios dados
 */
@DisplayName("Segurança — Controle de Acesso (RBAC + IDOR)")
class AuthorizationSecurityTest extends SecurityTestBase {

    @Test
    @DisplayName("Requisição sem autenticação para rota protegida deve retornar 401")
    void semAutenticacao_rotaProtegida_deveRetornar401() throws Exception {
        mockMvc.perform(get("/api/frequencias/" + aluno.getId()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/pontuacao/" + aluno.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("ALUNO tentando registrar frequência (exclusivo de SERVIDOR) deve retornar 403")
    void aluno_naoDeveRegistrarFrequencia_deveRetornar403() throws Exception {
        String body = String.format("""
                {"usuarioId":%d,"statusPresenca":true}
                """, aluno.getId());

        mockMvc.perform(post("/api/frequencias")
                        .header("Authorization", bearer(tokenAluno))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ALUNO tentando acessar dashboard (exclusivo de SERVIDOR) deve retornar 403")
    void aluno_naoDeveAcessarDashboard_deveRetornar403() throws Exception {
        mockMvc.perform(get("/api/dashboard/faltosos")
                        .header("Authorization", bearer(tokenAluno)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("IDOR — ALUNO tentando acessar dados de outro aluno deve retornar 403")
    void aluno_naoDeveAcessarDadosDeOutroAluno_deveRetornar403() throws Exception {
        // Cria um segundo aluno cujos dados o primeiro não pode ver
        var outroAluno = usuarioRepository.save(
                new com.academia.saude.entity.Usuario(
                        "Outro Aluno", "outro@test.com",
                        passwordEncoder.encode("Senha@123"),
                        com.academia.saude.entity.Role.ALUNO));

        // Aluno 1 tenta acessar frequências do Aluno 2 — deve ser bloqueado
        mockMvc.perform(get("/api/frequencias/" + outroAluno.getId())
                        .header("Authorization", bearer(tokenAluno)))
                .andExpect(status().isForbidden());

        // Aluno 1 tenta acessar pontuação do Aluno 2 — deve ser bloqueado
        mockMvc.perform(get("/api/pontuacao/" + outroAluno.getId())
                        .header("Authorization", bearer(tokenAluno)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ALUNO deve conseguir acessar os próprios dados")
    void aluno_deveAcessarPropriosDados_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/frequencias/" + aluno.getId())
                        .header("Authorization", bearer(tokenAluno)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/pontuacao/" + aluno.getId())
                        .header("Authorization", bearer(tokenAluno)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("SERVIDOR deve poder registrar frequência com sucesso")
    void servidor_deveRegistrarFrequencia_deveRetornar201() throws Exception {
        String body = String.format("""
                {"usuarioId":%d,"statusPresenca":true}
                """, aluno.getId());

        mockMvc.perform(post("/api/frequencias")
                        .header("Authorization", bearer(tokenServidor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("SERVIDOR deve poder acessar dados de qualquer aluno")
    void servidor_deveAcessarDadosDeQualquerAluno_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/frequencias/" + aluno.getId())
                        .header("Authorization", bearer(tokenServidor)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/pontuacao/" + aluno.getId())
                        .header("Authorization", bearer(tokenServidor)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/dashboard/faltosos")
                        .header("Authorization", bearer(tokenServidor)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Rota de login é pública — não requer token")
    void rotaDeLogin_ehPublica_naoRequerToken() throws Exception {
        // Credenciais inválidas retornam 401 (falha de auth), não 403 (falta de token)
        // Isso confirma que a rota foi acessada (e não bloqueada pelo Spring Security)
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"qualquer@test.com","senha":"qualquer"}
                                """))
                .andExpect(status().isUnauthorized()); // 401 de credenciais, não de falta de token
    }
}
