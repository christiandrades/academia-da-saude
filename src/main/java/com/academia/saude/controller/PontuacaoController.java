package com.academia.saude.controller;

import com.academia.saude.entity.Pontuacao;
import com.academia.saude.service.PontuacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pontuacao")
public class PontuacaoController {

    private final PontuacaoService pontuacaoService;

    public PontuacaoController(PontuacaoService pontuacaoService) {
        this.pontuacaoService = pontuacaoService;
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<Map<String, Object>> consultar(@PathVariable Long usuarioId) {
        Integer total = pontuacaoService.totalPontos(usuarioId);
        List<Pontuacao> historico = pontuacaoService.historico(usuarioId);
        return ResponseEntity.ok(Map.of("total", total, "historico", historico));
    }
}
