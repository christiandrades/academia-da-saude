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

/**
 * Serviço responsável pelo registro e consulta de frequências.
 *
 * Ponto central da regra de negócio de presença:
 * ao registrar uma presença confirmada, dispara automaticamente o lançamento de pontos,
 * mantendo a gamificação sincronizada com a frequência.
 */
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

    /**
     * Registra uma presença ou ausência para o aluno informado.
     *
     * @Transactional garante que o registro de frequência e o lançamento de pontos
     * sejam salvos juntos — se um falhar, o outro é revertido (rollback automático).
     */
    @Transactional
    public Frequencia registrar(FrequenciaRequest request) {
        // Valida se o aluno existe antes de registrar
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + request.usuarioId()));

        Frequencia frequencia = new Frequencia(usuario, request.statusPresenca());
        frequenciaRepository.save(frequencia);

        // Pontos são concedidos apenas quando o aluno está presente (statusPresenca = true)
        if (Boolean.TRUE.equals(request.statusPresenca())) {
            pontuacaoService.registrarPontosPorPresenca(usuario);
        }

        return frequencia;
    }

    // Retorna o histórico completo de frequências de um aluno
    public List<Frequencia> listarPorUsuario(Long usuarioId) {
        return frequenciaRepository.findByUsuarioId(usuarioId);
    }
}
