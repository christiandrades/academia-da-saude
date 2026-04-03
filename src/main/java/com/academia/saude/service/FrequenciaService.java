package com.academia.saude.service;

import com.academia.saude.dto.FrequenciaRequest;
import com.academia.saude.entity.Frequencia;
import com.academia.saude.entity.Usuario;
import com.academia.saude.repository.FrequenciaRepository;
import com.academia.saude.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class FrequenciaService {

    private final FrequenciaRepository frequenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PontuacaoService pontuacaoService;

    public FrequenciaService(FrequenciaRepository frequenciaRepository,
                             UsuarioRepository usuarioRepository,
                             PontuacaoService pontuacaoService) {
        this.frequenciaRepository = frequenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.pontuacaoService = pontuacaoService;
    }

    @Transactional
    public Frequencia registrar(FrequenciaRequest request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + request.usuarioId()));

        Frequencia frequencia = new Frequencia(usuario, request.statusPresenca());
        frequenciaRepository.save(frequencia);

        if (Boolean.TRUE.equals(request.statusPresenca())) {
            pontuacaoService.registrarPontosPorPresenca(usuario);
        }

        return frequencia;
    }

    public List<Frequencia> listarPorUsuario(Long usuarioId) {
        return frequenciaRepository.findByUsuarioId(usuarioId);
    }
}
