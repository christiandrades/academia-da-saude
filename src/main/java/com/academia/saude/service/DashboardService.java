package com.academia.saude.service;

import com.academia.saude.entity.Usuario;
import com.academia.saude.repository.FrequenciaRepository;
import com.academia.saude.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DashboardService {

    private final FrequenciaRepository frequenciaRepository;
    private final UsuarioRepository usuarioRepository;

    public DashboardService(FrequenciaRepository frequenciaRepository, UsuarioRepository usuarioRepository) {
        this.frequenciaRepository = frequenciaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> listarFaltosos(int diasRetroativos) {
        LocalDateTime desde = LocalDateTime.now().minusDays(diasRetroativos);
        List<Long> ids = frequenciaRepository.findIdsDeFaltosos(desde);
        return usuarioRepository.findAllById(ids);
    }
}
