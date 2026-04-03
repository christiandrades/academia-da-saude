package com.academia.saude.controller;

import com.academia.saude.dto.FrequenciaRequest;
import com.academia.saude.entity.Frequencia;
import com.academia.saude.service.FrequenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller responsável pelos endpoints de frequência.
 *
 * O registro de presença é restrito a SERVIDOR (configurado no SecurityConfig).
 * A consulta do histórico por usuário é acessível a qualquer usuário autenticado.
 */
@RestController
@RequestMapping("/api/frequencias")
public class FrequenciaController {

    private final FrequenciaService frequenciaService;

    public FrequenciaController(FrequenciaService frequenciaService) {
        this.frequenciaService = frequenciaService;
    }

    /**
     * POST /api/frequencias
     *
     * Registra uma presença ou ausência para o aluno informado.
     * Retorna HTTP 201 (Created) com o registro salvo.
     * Acesso: somente SERVIDOR.
     */
    @PostMapping
    public ResponseEntity<Frequencia> registrar(@Valid @RequestBody FrequenciaRequest request) {
        Frequencia frequencia = frequenciaService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(frequencia);
    }

    /**
     * GET /api/frequencias/{usuarioId}
     *
     * Retorna o histórico completo de frequências de um aluno.
     * ALUNO só pode ver o próprio histórico; SERVIDOR pode ver o de qualquer aluno.
     */
    @GetMapping("/{usuarioId}")
    @PreAuthorize("authentication.principal.id.equals(#usuarioId) or hasRole('SERVIDOR')")
    public ResponseEntity<List<Frequencia>> listar(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(frequenciaService.listarPorUsuario(usuarioId));
    }
}
