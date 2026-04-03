package com.academia.saude.config;

import com.academia.saude.repository.UsuarioRepository;
import com.academia.saude.security.JwtFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuração central de segurança da aplicação.
 *
 * Define:
 * - Quais rotas são públicas e quais exigem autenticação
 * - Quais perfis (roles) têm acesso a cada grupo de endpoints
 * - Como o Spring Security autentica os usuários (via banco de dados)
 * - Que a API é stateless (sem sessão no servidor — usa JWT)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Habilita @PreAuthorize e @Secured nos controllers
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UsuarioRepository usuarioRepository;

    // Origens permitidas lidas do application.yml — separadas por vírgula quando houver mais de uma
    // Ex.: http://localhost:4200 (dev) ou https://academia.sus.gov.br (produção)
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtFilter jwtFilter, UsuarioRepository usuarioRepository) {
        this.jwtFilter = jwtFilter;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Define as regras de autorização por rota (RBAC).
     *
     * Ordem das regras importa: a primeira que casar com a rota é aplicada.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // CORS deve ser configurado antes do CSRF e dos filtros de autenticação.
                // O Spring Security processa requisições OPTIONS de preflight com CORS antes
                // de qualquer verificação de token — sem isso, o Angular seria bloqueado.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // CSRF desabilitado: APIs REST stateless não precisam de proteção CSRF
                .csrf(csrf -> csrf.disable())

                // Sem sessão no servidor — cada requisição é autenticada via token JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Rota de login é pública — qualquer um pode acessar
                        .requestMatchers("/api/auth/**").permitAll()

                        // Dashboard de faltosos: restrito a SERVIDOR
                        .requestMatchers("/api/dashboard/**").hasRole("SERVIDOR")

                        // Registro de presença (POST /frequencias): restrito a SERVIDOR
                        .requestMatchers("/api/frequencias").hasRole("SERVIDOR")

                        // Qualquer outra rota exige autenticação (token válido)
                        .anyRequest().authenticated()
                )

                // Retorna 401 para requisições sem autenticação válida (em vez do padrão 403)
                // Retorna 403 para usuários autenticados sem permissão suficiente para a rota
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> res.sendError(401, "Não autenticado"))
                        .accessDeniedHandler((req, res, e) -> res.sendError(403, "Acesso negado"))
                )

                .authenticationProvider(authenticationProvider())

                // Insere o filtro JWT antes do filtro padrão de autenticação por formulário
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Ensina o Spring Security a carregar um usuário pelo e-mail.
     * Usado durante a validação do token JWT no JwtFilter.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return email -> usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
    }

    /**
     * Provider que conecta o UserDetailsService ao PasswordEncoder.
     * Responsável por comparar a senha digitada (texto puro) com o hash BCrypt salvo no banco.
     *
     * hideUserNotFoundExceptions = true (padrão): faz com que "usuário não encontrado"
     * e "senha errada" retornem a mesma mensagem genérica, evitando enumeração de usuários.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * Define as regras de CORS para permitir que o Angular consuma a API.
     *
     * - allowedOrigins: domínios autorizados (configurável por ambiente via application.yml)
     * - allowedMethods: inclui OPTIONS para que o browser complete o preflight sem bloqueio
     * - allowedHeaders: Authorization é obrigatório para envio do JWT; Content-Type para JSON
     * - exposedHeaders: permite que o Angular leia o header Authorization na resposta
     * - maxAge: o browser cacheia o resultado do preflight por 1 hora, evitando requisições extras
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Aceita múltiplas origens separadas por vírgula (ex.: dev + homologação)
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica esta configuração a todos os endpoints da API
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // Expõe o AuthenticationManager como bean para ser injetado no AuthService
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BCrypt é o algoritmo de hash de senhas recomendado pelo Spring Security.
     * Adiciona salt automático, tornando cada hash único mesmo para senhas iguais.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
