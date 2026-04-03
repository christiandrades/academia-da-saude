package com.academia.saude.service;

import com.academia.saude.entity.Usuario;
import com.academia.saude.repository.FrequenciaRepository;
import com.academia.saude.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Serviço responsável pelo dashboard de resgate ativo.
 *
 * Identifica alunos que não compareceram à academia no período informado,
 * permitindo que o servidor tome uma ação proativa (contato, motivação etc.)
 * para reduzir a evasão no programa Academia da Saúde.
 */
@Service
public class DashboardService {

    private final FrequenciaRepository frequenciaRepository;
    private final UsuarioRepository usuarioRepository;

    public DashboardService(FrequenciaRepository frequenciaRepository, UsuarioRepository usuarioRepository) {
        this.frequenciaRepository = frequenciaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Retorna a lista de alunos considerados faltosos no período informado.
     *
     * @param diasRetroativos quantidade de dias para olhar para trás (ex.: 30 = último mês)
     *
     * Estratégia em dois passos para melhor desempenho:
     * 1. Busca apenas os IDs dos faltosos (query agregada, leve)
     * 2. Carrega os usuários completos apenas com os IDs encontrados
     */
    public List<Usuario> listarFaltosos(int diasRetroativos) {
        // Valida o range do parâmetro para evitar queries abusivas ou com lógica invertida
        if (diasRetroativos < 1 || diasRetroativos > 365) {
            throw new IllegalArgumentException("O parâmetro 'dias' deve ser entre 1 e 365");
        }

        // Calcula a data de corte do período analisado
        LocalDateTime desde = LocalDateTime.now().minusDays(diasRetroativos);

        // Obtém os IDs de quem não teve nenhuma presença no período
        List<Long> ids = frequenciaRepository.findIdsDeFaltosos(desde);

        // Carrega os dados completos dos alunos faltosos
        return usuarioRepository.findAllById(ids);
    }
}
