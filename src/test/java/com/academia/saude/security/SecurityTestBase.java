package com.academia.saude.security;

import com.academia.saude.entity.Role;
import com.academia.saude.entity.Usuario;
import com.academia.saude.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

/**
 * Classe base para todos os testes de segurança.
 *
 * Configura o contexto Spring Boot completo com banco H2 em memória,
 * cria usuários de teste (ALUNO e SERVIDOR) e oferece utilitários
 * para simular vetores de ataque contra JWT.
 *
 * @Transactional: cada teste roda em uma transação que é revertida ao final,
 * garantindo isolamento total entre os casos de teste.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class SecurityTestBase {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected UsuarioRepository usuarioRepository;
    @Autowired protected PasswordEncoder passwordEncoder;
    @Autowired protected JwtUtil jwtUtil;
    @Autowired protected ObjectMapper objectMapper;

    // Chave secreta injetada do application-test.yml para uso nos utilitários de ataque
    @Value("${jwt.secret}") protected String jwtSecret;

    protected Usuario aluno;
    protected Usuario servidor;
    protected String tokenAluno;
    protected String tokenServidor;

    @BeforeEach
    void configurarUsuariosDeTeste() {
        aluno = usuarioRepository.save(new Usuario(
                "Aluno Teste", "aluno@test.com",
                passwordEncoder.encode("Senha@123"), Role.ALUNO));

        servidor = usuarioRepository.save(new Usuario(
                "Servidor Teste", "servidor@test.com",
                passwordEncoder.encode("Senha@123"), Role.SERVIDOR));

        tokenAluno = jwtUtil.generateToken(aluno);
        tokenServidor = jwtUtil.generateToken(servidor);
    }

    /** Formata o token com o prefixo Bearer para uso no header Authorization */
    protected String bearer(String token) {
        return "Bearer " + token;
    }

    /**
     * Simula ataque com token expirado.
     * Gera um token cuja data de expiração está no passado.
     */
    protected String gerarTokenExpirado(String email) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis() - 90_000_000L))
                .expiration(new Date(System.currentTimeMillis() - 3_600_000L))
                .signWith(key)
                .compact();
    }

    /**
     * Simula ataque de adulteração de payload (JWT tampering).
     * Substitui o payload do token por outro com e-mail diferente,
     * mantendo a assinatura original — que agora é inválida.
     */
    protected String adulterarPayload(String token) {
        String[] partes = token.split("\\.");
        String payloadAdulterado = Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"sub\":\"hacker@evil.com\",\"iat\":9999999,\"exp\":9999999999}"
                        .getBytes(StandardCharsets.UTF_8));
        return partes[0] + "." + payloadAdulterado + "." + partes[2];
    }

    /**
     * Simula ataque de forja de token (token forgery).
     * Gera um token válido estruturalmente mas assinado com uma chave diferente da aplicação.
     */
    protected String gerarTokenComChaveDiferente(String email) {
        SecretKey chaveAtacante = Keys.hmacShaKeyFor(
                "chave-do-atacante-completamente-diferente-256bits!!".getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86_400_000L))
                .signWith(chaveAtacante)
                .compact();
    }
}
