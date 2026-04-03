package com.academia.saude.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de segurança para o mecanismo de autenticação JWT.
 *
 * Vetores de ataque cobertos:
 * - Ausência de token (requisição anônima)
 * - Token sem prefixo "Bearer"
 * - Token com conteúdo aleatório (inválido)
 * - JWT Payload Tampering (adulteração do payload)
 * - Token expirado
 * - Token forjado com chave diferente (token forgery)
 * - Tokens válidos (caminho feliz para ALUNO e SERVIDOR)
 */
@DisplayName("Segurança — JWT")
class JwtSecurityTest extends SecurityTestBase {

    private static final String ROTA_AUTENTICADA = "/api/frequencias/";

    @Test
    @DisplayName("Requisição sem header Authorization deve retornar 401")
    void semToken_deveRetornar401() throws Exception {
        mockMvc.perform(get(ROTA_AUTENTICADA + 1))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Header Authorization sem prefixo 'Bearer' deve retornar 401")
    void headerSemPrefixoBearer_deveRetornar401() throws Exception {
        mockMvc.perform(get(ROTA_AUTENTICADA + 1)
                        .header("Authorization", tokenAluno)) // sem "Bearer "
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Token com conteúdo aleatório (não é JWT) deve retornar 401")
    void tokenAleatorio_deveRetornar401() throws Exception {
        mockMvc.perform(get(ROTA_AUTENTICADA + 1)
                        .header("Authorization", "Bearer este.nao.e.um.jwt.valido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT Payload Tampering — payload adulterado com assinatura original deve retornar 401")
    void payloadAdulterado_deveRetornar401() throws Exception {
        // Ataque: altera o campo 'sub' (e-mail) do token para se passar por outro usuário,
        // mas mantém a assinatura do token original — a verificação de assinatura rejeita
        String tokenAdulterado = adulterarPayload(tokenAluno);

        mockMvc.perform(get(ROTA_AUTENTICADA + aluno.getId())
                        .header("Authorization", bearer(tokenAdulterado)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Token expirado deve retornar 401")
    void tokenExpirado_deveRetornar401() throws Exception {
        String tokenExpirado = gerarTokenExpirado(aluno.getEmail());

        mockMvc.perform(get(ROTA_AUTENTICADA + aluno.getId())
                        .header("Authorization", bearer(tokenExpirado)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Token forjado com chave diferente (token forgery) deve retornar 401")
    void tokenForjadoComChaveDiferente_deveRetornar401() throws Exception {
        // Ataque: atacante tenta gerar um token válido usando uma chave secreta diferente da aplicação
        String tokenForjado = gerarTokenComChaveDiferente(aluno.getEmail());

        mockMvc.perform(get(ROTA_AUTENTICADA + aluno.getId())
                        .header("Authorization", bearer(tokenForjado)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Token válido de ALUNO deve permitir acesso à própria rota autenticada")
    void tokenValidoAluno_permiteAcessoEmRotaAutenticada() throws Exception {
        mockMvc.perform(get(ROTA_AUTENTICADA + aluno.getId())
                        .header("Authorization", bearer(tokenAluno)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Token válido de SERVIDOR deve permitir acesso ao dashboard")
    void tokenValidoServidor_permiteAcessoAoDashboard() throws Exception {
        mockMvc.perform(get("/api/dashboard/faltosos")
                        .header("Authorization", bearer(tokenServidor)))
                .andExpect(status().isOk());
    }
}
