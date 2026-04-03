package com.academia.saude.controller;

import com.academia.saude.entity.Usuario;
import com.academia.saude.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller responsável pelo dashboard de resgate ativo.
 * Acesso restrito a SERVIDOR (configurado no SecurityConfig).
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/dashboard/faltosos?dias=30
     *
     * Retorna a lista de alunos que não tiveram nenhuma presença confirmada
     * nos últimos N dias (padrão: 30 dias).
     *
     * O parâmetro "dias" é opcional — se não informado, usa 30 como padrão.
     * Acesso: somente SERVIDOR.
     */
    @GetMapping("/faltosos")
    public ResponseEntity<List<Usuario>> faltosos(
            @RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(dashboardService.listarFaltosos(dias));
    }
}
