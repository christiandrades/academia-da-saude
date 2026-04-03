package com.academia.saude.service;

import com.academia.saude.dto.LoginRequest;
import com.academia.saude.dto.LoginResponse;
import com.academia.saude.entity.Usuario;
import com.academia.saude.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

/**
 * Serviço responsável pela autenticação do usuário.
 *
 * Delega a verificação de credenciais ao Spring Security (AuthenticationManager),
 * que compara o hash BCrypt da senha salva no banco com a senha informada no login.
 */
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Autentica o usuário e retorna um token JWT.
     *
     * O AuthenticationManager lança BadCredentialsException automaticamente
     * se o e-mail não existir ou a senha estiver errada — não é necessário tratar manualmente.
     */
    public LoginResponse login(LoginRequest request) {
        // Autentica as credenciais contra o banco de dados
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );

        // getPrincipal() retorna o objeto Usuario autenticado
        Usuario usuario = (Usuario) auth.getPrincipal();

        // Gera o token JWT que será usado nas próximas requisições
        String token = jwtUtil.generateToken(usuario);

        return new LoginResponse(token, usuario.getRole().name());
    }
}
