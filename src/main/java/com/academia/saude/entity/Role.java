package com.academia.saude.entity;

/**
 * Define os perfis de acesso do sistema.
 *
 * ALUNO    → usuário comum; só pode consultar seus próprios dados.
 * SERVIDOR → profissional de saúde; pode registrar presenças e acessar o dashboard.
 */
public enum Role {
    ALUNO,
    SERVIDOR
}
