package com.academia.saude.controller;

import com.academia.saude.entity.Usuario;
import com.academia.saude.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/faltosos")
    public ResponseEntity<List<Usuario>> faltosos(
            @RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(dashboardService.listarFaltosos(dias));
    }
}
