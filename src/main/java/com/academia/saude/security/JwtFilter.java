package com.academia.saude.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro HTTP que intercepta todas as requisições e valida o token JWT.
 *
 * Estende OncePerRequestFilter para garantir que a lógica seja executada
 * exatamente uma vez por requisição (sem duplicação em redirecionamentos).
 *
 * Fluxo de execução:
 * 1. Lê o header "Authorization" da requisição
 * 2. Extrai o token (remove o prefixo "Bearer ")
 * 3. Valida o token e autentica o usuário no SecurityContext
 * 4. Passa a requisição para o próximo filtro da cadeia
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Se não houver token, continua a cadeia sem autenticar (rotas públicas passam normalmente)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Remove o prefixo "Bearer " para obter somente o token
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            // Só autentica se o e-mail foi extraído e o usuário ainda não está autenticado
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtUtil.isTokenValid(token, userDetails)) {
                    // Cria o objeto de autenticação com as permissões do usuário
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    // Adiciona detalhes da requisição (IP, session id) ao contexto de autenticação
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Registra o usuário como autenticado no contexto de segurança do Spring
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (JwtException e) {
            // Token malformado, expirado ou com assinatura inválida:
            // limpa o contexto e deixa a cadeia continuar sem autenticação.
            // O Spring Security retornará 401 para rotas protegidas.
            SecurityContextHolder.clearContext();
        }

        // Continua o processamento para o próximo filtro ou para o controller
        filterChain.doFilter(request, response);
    }
}
