package com.academia.saude.controller;

import com.academia.saude.dto.FrequenciaRequest;
import com.academia.saude.entity.Frequencia;
import com.academia.saude.service.FrequenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/frequencias")
public class FrequenciaController {

    private final FrequenciaService frequenciaService;

    public FrequenciaController(FrequenciaService frequenciaService) {
        this.frequenciaService = frequenciaService;
    }

    @PostMapping
    public ResponseEntity<Frequencia> registrar(@Valid @RequestBody FrequenciaRequest request) {
        Frequencia frequencia = frequenciaService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(frequencia);
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<Frequencia>> listar(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(frequenciaService.listarPorUsuario(usuarioId));
    }
}
