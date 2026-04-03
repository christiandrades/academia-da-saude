package com.academia.saude.service;

import com.academia.saude.entity.Pontuacao;
import com.academia.saude.entity.Usuario;
import com.academia.saude.repository.PontuacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço responsável pela gamificação: lançamento e consulta de pontos.
 *
 * Cada presença confirmada gera um registro auditável na tabela tb_pontuacao,
 * permitindo rastrear exatamente quando e como os pontos foram acumulados.
 */
@Service
public class PontuacaoService {

    // Regra de negócio: quantidade de pontos concedidos por presença confirmada
    private static final int PONTOS_POR_PRESENCA = 10;

    private final PontuacaoRepository pontuacaoRepository;

    public PontuacaoService(PontuacaoRepository pontuacaoRepository) {
        this.pontuacaoRepository = pontuacaoRepository;
    }

    /**
     * Lança 10 pontos para o aluno que teve presença confirmada.
     * O motivo é salvo para auditoria — facilita rastrear a origem dos pontos.
     */
    @Transactional
    public void registrarPontosPorPresenca(Usuario usuario) {
        Pontuacao pontuacao = new Pontuacao(usuario, PONTOS_POR_PRESENCA, "Presença registrada");
        pontuacaoRepository.save(pontuacao);
    }

    // Retorna a soma total de pontos acumulados pelo aluno (0 se não tiver nenhum)
    public Integer totalPontos(Long usuarioId) {
        return pontuacaoRepository.sumPontosByUsuarioId(usuarioId);
    }

    // Retorna o histórico detalhado de todos os lançamentos de pontos do aluno
    public List<Pontuacao> historico(Long usuarioId) {
        return pontuacaoRepository.findByUsuarioId(usuarioId);
    }
}
