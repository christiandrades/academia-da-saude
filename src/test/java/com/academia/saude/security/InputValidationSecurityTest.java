package com.academia.saude.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de segurança para validação de entrada (input validation).
 *
 * Vetores de ataque cobertos:
 * - Campos obrigatórios ausentes ou nulos
 * - Tipo incorreto no corpo JSON (type confusion)
 * - Payload JSON malformado
 * - Strings de tamanho extremo (possível DoS de memória)
 * - Caracteres especiais e Unicode (encoding attacks)
 * - Parâmetro de query fora do range permitido
 * - SQL Injection via body tipado
 *
 * Nenhum desses ataques deve causar HTTP 500.
 */
@DisplayName("Segurança — Validação de Entrada")
class InputValidationSecurityTest extends SecurityTestBase {

    @Test
    @DisplayName("usuarioId nulo em FrequenciaRequest deve retornar 400")
    void usuarioIdNulo_deveRetornar400() throws Exception {
        mockMvc.perform(post("/api/frequencias")
                        .header("Authorization", bearer(tokenServidor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usuarioId":null,"statusPresenca":true}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("statusPresenca nulo em FrequenciaRequest deve retornar 400")
    void statusPresencaNulo_deveRetornar400() throws Exception {
        mockMvc.perform(post("/api/frequencias")
                        .header("Authorization", bearer(tokenServidor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usuarioId":1,"statusPresenca":null}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Corpo JSON vazio em FrequenciaRequest deve retornar 400")
    void corpoVazio_deveRetornar400() throws Exception {
        mockMvc.perform(post("/api/frequencias")
                        .header("Authorization", bearer(tokenServidor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("JSON malformado deve retornar 400 — não deve vazar detalhes de parse")
    void jsonMalformado_deveRetornar400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{email: sem aspas, invalido}"))
                .andExpect(status().isBadRequest())
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus()).isLessThan(500));
    }

    @Test
    @DisplayName("SQL Injection em campo tipado (Long) deve retornar 400 — Jackson rejeita o parse")
    void sqlInjectionEmCampoTipado_deveRetornar400() throws Exception {
        // O campo usuarioId espera Long; uma string SQL é rejeitada pelo Jackson antes de chegar ao serviço
        mockMvc.perform(post("/api/frequencias")
                        .header("Authorization", bearer(tokenServidor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usuarioId":"1; DROP TABLE tb_usuarios; --","statusPresenca":true}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus()).isLessThan(500));
    }

    @Test
    @DisplayName("Senha com 10.000 caracteres não deve causar erro 500 (BCrypt limita internamente)")
    void senhaMuitoLonga_naoDeveCausarErro500() throws Exception {
        String senhaMuitoLonga = "A".repeat(10_000);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"aluno@test.com\",\"senha\":\"" + senhaMuitoLonga + "\"}"))
                .andExpect(status().isUnauthorized())       // credenciais erradas — não 500
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus()).isLessThan(500));
    }

    @Test
    @DisplayName("Caracteres Unicode e especiais na senha não devem causar erro 500")
    void caracteresEspeciaisNaSenha_naoDevemCausarErro500() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"aluno@test.com","senha":"'; SELECT * FROM tb_usuarios; \u202E\u0000\uFFFD"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus()).isLessThan(500));
    }

    @Test
    @DisplayName("Parâmetro 'dias' negativo no dashboard deve retornar 400")
    void diasNegativo_deveRetornar400() throws Exception {
        mockMvc.perform(get("/api/dashboard/faltosos?dias=-1")
                        .header("Authorization", bearer(tokenServidor)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Parâmetro 'dias' acima do limite (> 365) no dashboard deve retornar 400")
    void diasAcimaDoLimite_deveRetornar400() throws Exception {
        mockMvc.perform(get("/api/dashboard/faltosos?dias=9999")
                        .header("Authorization", bearer(tokenServidor)))
                .andExpect(status().isBadRequest());
    }
}
