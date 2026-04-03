package com.academia.saude.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utilitário responsável por gerar, validar e extrair informações de tokens JWT.
 *
 * JWT (JSON Web Token) é o mecanismo de autenticação stateless desta API:
 * o servidor não guarda sessão — cada requisição carrega o token no header,
 * e o servidor valida a assinatura para confirmar a identidade do usuário.
 */
@Component
public class JwtUtil {

    // Chave criptográfica usada para assinar e verificar os tokens
    private final SecretKey secretKey;

    // Tempo de expiração do token em milissegundos (configurado no application.yml)
    private final long expiration;

    /**
     * Os valores são injetados do application.yml via @Value.
     * A chave secreta é convertida para um objeto SecretKey usando HMAC-SHA.
     */
    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    /**
     * Gera um token JWT para o usuário autenticado.
     * O "subject" do token é o e-mail do usuário — funciona como identificador.
     */
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())       // e-mail como identificador
                .issuedAt(new Date())                     // data/hora de emissão
                .expiration(new Date(System.currentTimeMillis() + expiration)) // data de expiração
                .signWith(secretKey)                      // assina com a chave secreta
                .compact();
    }

    // Extrai o e-mail (subject) do token
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    /**
     * Valida se o token pertence ao usuário informado e ainda não expirou.
     * Chamado pelo JwtFilter a cada requisição autenticada.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // Verifica se a data de expiração do token já passou
    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    /**
     * Faz o parse completo do token e retorna os Claims (payload).
     * Lança exceção automaticamente se a assinatura for inválida.
     */
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)   // verifica a assinatura com a chave secreta
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
