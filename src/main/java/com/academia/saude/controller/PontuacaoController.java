package com.academia.saude.controller;

import com.academia.saude.entity.Pontuacao;
import com.academia.saude.service.PontuacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller responsável pelos endpoints de pontuação (gamificação).
 * Acessível a qualquer usuário autenticado.
 */
@RestController
@RequestMapping("/api/pontuacao")
public class PontuacaoController {

    private final PontuacaoService pontuacaoService;

    public PontuacaoController(PontuacaoService pontuacaoService) {
        this.pontuacaoService = pontuacaoService;
    }

    /**
     * GET /api/pontuacao/{usuarioId}
     *
     * Retorna o total de pontos acumulados e o histórico detalhado de lançamentos.
     *
     * Resposta:
     * {
     *   "total": 80,
     *   "historico": [ { "pontos": 10, "motivo": "Presença registrada", ... }, ... ]
     * }
     */
    @GetMapping("/{usuarioId}")
    public ResponseEntity<Map<String, Object>> consultar(@PathVariable Long usuarioId) {
        Integer total = pontuacaoService.totalPontos(usuarioId);
        List<Pontuacao> historico = pontuacaoService.historico(usuarioId);
        return ResponseEntity.ok(Map.of("total", total, "historico", historico));
    }
}
