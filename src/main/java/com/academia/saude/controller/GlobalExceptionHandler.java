package com.academia.saude.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Tratamento centralizado de exceções para todos os controllers.
 *
 * Garante que:
 * - Exceções de autenticação retornem 401 (não 500)
 * - Recursos não encontrados retornem 404 (não 500)
 * - Erros de validação retornem 400 com mensagem clara
 * - Argumentos inválidos retornem 400
 * - Nenhuma exceção interna vaze para o cliente como HTTP 500
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Captura falhas de autenticação (credenciais inválidas).
     * Retorna mensagem genérica para ambos os casos — usuário inexistente e senha errada —
     * impedindo que um atacante descubra quais e-mails estão cadastrados (enumeração de usuários).
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> credenciaisInvalidas(BadCredentialsException e) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("erro", "Credenciais inválidas"));
    }

    /**
     * Captura recursos não encontrados (ex.: usuário inexistente ao registrar frequência).
     * Retorna mensagem genérica para não expor detalhes do banco de dados.
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> recursoNaoEncontrado(NoSuchElementException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erro", "Recurso não encontrado"));
    }

    /**
     * Captura erros de validação de Bean Validation (@NotBlank, @Email, @NotNull, etc.).
     * Retorna 400 com a primeira mensagem de erro de validação encontrada.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validacaoInvalida(MethodArgumentNotValidException e) {
        String mensagem = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(err -> "Campo '" + err.getField() + "': " + err.getDefaultMessage())
                .orElse("Dados inválidos na requisição");
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erro", mensagem));
    }

    /**
     * Captura argumentos inválidos (ex.: parâmetro fora do range permitido).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> argumentoInvalido(IllegalArgumentException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erro", e.getMessage()));
    }
}
