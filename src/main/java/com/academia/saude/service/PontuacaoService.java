package com.academia.saude.service;

import com.academia.saude.entity.Pontuacao;
import com.academia.saude.entity.Usuario;
import com.academia.saude.repository.PontuacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PontuacaoService {

    private static final int PONTOS_POR_PRESENCA = 10;

    private final PontuacaoRepository pontuacaoRepository;

    public PontuacaoService(PontuacaoRepository pontuacaoRepository) {
        this.pontuacaoRepository = pontuacaoRepository;
    }

    @Transactional
    public void registrarPontosPorPresenca(Usuario usuario) {
        Pontuacao pontuacao = new Pontuacao(usuario, PONTOS_POR_PRESENCA, "Presença registrada");
        pontuacaoRepository.save(pontuacao);
    }

    public Integer totalPontos(Long usuarioId) {
        return pontuacaoRepository.sumPontosByUsuarioId(usuarioId);
    }

    public List<Pontuacao> historico(Long usuarioId) {
        return pontuacaoRepository.findByUsuarioId(usuarioId);
    }
}
