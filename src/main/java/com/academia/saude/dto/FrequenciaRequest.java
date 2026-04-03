package com.academia.saude.dto;

import jakarta.validation.constraints.NotNull;

public record FrequenciaRequest(
        @NotNull Long usuarioId,
        @NotNull Boolean statusPresenca
) {}