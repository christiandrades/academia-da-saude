package com.academia.saude.controller;

import com.academia.saude.dto.LoginRequest;
import com.academia.saude.dto.LoginResponse;
import com.academia.saude.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller responsável pelos endpoints de autenticação.
 * Esta é a única rota pública da API — não exige token JWT.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/login
     *
     * Autentica o usuário com e-mail e senha.
     * Retorna um token JWT e o perfil (role) do usuário autenticado.
     *
     * @Valid garante que os campos obrigatórios do LoginRequest sejam validados
     * antes de chegar ao serviço.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
