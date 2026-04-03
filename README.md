# Sistema de Gestão & Gamificação — Academia da Saúde (SUS)

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen?style=flat-square&logo=springboot)
![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-brightgreen?style=flat-square&logo=springsecurity)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Maven](https://img.shields.io/badge/Maven-3.8+-red?style=flat-square&logo=apachemaven)
![Status](https://img.shields.io/badge/Status-MVP-yellow?style=flat-square)
![Testes](https://img.shields.io/badge/Testes_de_Segurança-31_casos-success?style=flat-square)

---

## Sobre o Projeto

A **Academia da Saúde** é um programa do Sistema Único de Saúde (SUS) que oferece espaços públicos de atividade física e promoção da saúde. Apesar da relevância do programa, o sistema oficial (e-SUS) não dispõe de ferramentas adequadas para:

- Monitorar a frequência dos usuários de forma eficiente
- Identificar proativamente alunos em risco de evasão
- Engajar e motivar a permanência no programa

Este projeto é uma **API REST** desenvolvida em Java com Spring Boot que preenche essas lacunas, combinando controle de frequência, gamificação e um dashboard de CRM para resgate ativo de alunos faltosos.

> Projeto desenvolvido a partir de 16 anos de experiência na gestão de programas de saúde pública, com foco em resolver problemas reais de retenção de usuários em academias do SUS.

---

## Funcionalidades

| Funcionalidade | Descrição | Perfil |
|---|---|---|
| Autenticação JWT | Login seguro com token de 24h | Todos |
| Registro de Frequência | Registra presença ou ausência do aluno | SERVIDOR |
| Gamificação | +10 pontos a cada presença confirmada | Automático |
| Histórico de Pontos | Trilha auditável de todos os lançamentos | ALUNO / SERVIDOR |
| Dashboard de Faltosos | Lista alunos sem presença nos últimos N dias | SERVIDOR |
| Controle de Acesso (RBAC) | Permissões diferenciadas por perfil | Automático |

---

## Arquitetura

O projeto segue a arquitetura em camadas padrão do ecossistema Spring:

```
Controller  →  Service  →  Repository  →  Banco de Dados
    ↑
  JWT Filter (valida token em toda requisição autenticada)
```

### Estrutura de Pacotes

```
src/main/java/com/academia/saude/
├── config/
│   └── SecurityConfig.java        # Configuração de segurança, RBAC e BCrypt
├── controller/
│   ├── AuthController.java        # POST /api/auth/login
│   ├── FrequenciaController.java  # POST/GET /api/frequencias
│   ├── PontuacaoController.java   # GET /api/pontuacao/{id}
│   └── DashboardController.java   # GET /api/dashboard/faltosos
├── dto/
│   ├── LoginRequest.java          # { email, senha }
│   ├── LoginResponse.java         # { token, role }
│   └── FrequenciaRequest.java     # { usuarioId, statusPresenca }
├── entity/
│   ├── Role.java                  # Enum: ALUNO | SERVIDOR
│   ├── Usuario.java               # Tabela tb_usuarios
│   ├── Frequencia.java            # Tabela tb_frequencia
│   └── Pontuacao.java             # Tabela tb_pontuacao
├── repository/
│   ├── UsuarioRepository.java
│   ├── FrequenciaRepository.java  # Query JPQL para identificar faltosos
│   └── PontuacaoRepository.java   # Query de soma de pontos por aluno
├── security/
│   ├── JwtUtil.java               # Geração e validação de tokens JWT
│   └── JwtFilter.java             # Filtro HTTP que intercepta cada requisição
└── service/
    ├── AuthService.java           # Lógica de autenticação
    ├── FrequenciaService.java     # Registro de presença + disparo de pontos
    ├── PontuacaoService.java      # Lançamento e consulta de pontos
    └── DashboardService.java      # Identificação de alunos faltosos
```

---

## Modelagem de Dados

### Diagrama de Entidades

```
tb_usuarios
├── id          BIGINT        PK, auto-increment
├── nome        VARCHAR       NOT NULL
├── email       VARCHAR       NOT NULL, UNIQUE
├── senha       VARCHAR       NOT NULL  (hash BCrypt)
└── role        VARCHAR       NOT NULL  (ENUM: ALUNO | SERVIDOR)
        │
        │ 1:N
        ├──────────────────────────────────────────┐
        │                                          │
tb_frequencia                              tb_pontuacao
├── id              BIGINT  PK             ├── id          BIGINT  PK
├── usuario_id      BIGINT  FK             ├── usuario_id  BIGINT  FK
├── data_hora       TIMESTAMP              ├── pontos      INTEGER
└── status_presenca BOOLEAN                ├── motivo      VARCHAR
                                           └── data_hora   TIMESTAMP
```

### Índices de Performance

| Tabela | Coluna(s) | Motivo |
|---|---|---|
| `tb_frequencia` | `usuario_id` | Busca do histórico por aluno |
| `tb_frequencia` | `data_hora` | Filtro por período no dashboard |
| `tb_pontuacao` | `usuario_id` | Soma de pontos por aluno |

### Decisões de Modelagem

- **PostgreSQL** — escolhido pela integridade referencial garantida por chaves estrangeiras, essencial para a consistência dos relatórios do dashboard.
- **ENUM como VARCHAR** — `EnumType.STRING` salva o nome textual (`ALUNO`, `SERVIDOR`) no banco, tornando o dado legível e sem dependência de índice numérico.
- **`tb_pontuacao` separada** — funciona como trilha de auditoria da gamificação. É possível rastrear exatamente quando e por qual motivo cada ponto foi concedido, garantindo rastreabilidade das regras de negócio.

---

## Segurança

### Autenticação

A API utiliza **JWT (JSON Web Token)** com o fluxo:

```
1. Cliente envia email + senha → POST /api/auth/login
2. Spring Security valida as credenciais contra o banco (hash BCrypt)
3. Servidor retorna um token JWT assinado (válido por 24h)
4. Cliente envia o token no header de cada requisição:
   Authorization: Bearer <token>
5. JwtFilter intercepta, valida a assinatura e autentica o usuário
```

### Controle de Acesso (RBAC)

| Rota | Método | Perfil Necessário |
|---|---|---|
| `/api/auth/login` | POST | Público |
| `/api/frequencias` | POST | SERVIDOR |
| `/api/frequencias/{id}` | GET | Autenticado |
| `/api/pontuacao/{id}` | GET | Autenticado |
| `/api/dashboard/faltosos` | GET | SERVIDOR |

### Proteção de Senhas

Senhas são armazenadas com **BCrypt**, que aplica salt automático tornando cada hash único — mesmo que dois usuários tenham a mesma senha, os hashes são diferentes.

---

## Endpoints da API

### Autenticação

**`POST /api/auth/login`**

```json
// Requisição
{
  "email": "servidor@sus.gov.br",
  "senha": "minhasenha"
}

// Resposta 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "SERVIDOR"
}
```

---

### Frequência

**`POST /api/frequencias`** — Requer: `SERVIDOR`

```json
// Requisição
{
  "usuarioId": 42,
  "statusPresenca": true
}

// Resposta 201 Created
{
  "id": 101,
  "dataHora": "2026-04-03T09:30:00",
  "statusPresenca": true
}
```

> Ao registrar presença (`statusPresenca: true`), o sistema automaticamente lança +10 pontos para o aluno.

---

**`GET /api/frequencias/{usuarioId}`** — Requer: Autenticado

```json
// Resposta 200 OK
[
  { "id": 101, "dataHora": "2026-04-03T09:30:00", "statusPresenca": true },
  { "id": 98,  "dataHora": "2026-04-01T08:15:00", "statusPresenca": false }
]
```

---

### Pontuação

**`GET /api/pontuacao/{usuarioId}`** — Requer: Autenticado

```json
// Resposta 200 OK
{
  "total": 80,
  "historico": [
    { "id": 10, "pontos": 10, "motivo": "Presença registrada", "dataHora": "2026-04-03T09:30:00" },
    { "id": 9,  "pontos": 10, "motivo": "Presença registrada", "dataHora": "2026-03-31T10:00:00" }
  ]
}
```

---

### Dashboard

**`GET /api/dashboard/faltosos?dias=30`** — Requer: `SERVIDOR`

Parâmetro `dias` é opcional (padrão: 30).

```json
// Resposta 200 OK — alunos sem nenhuma presença nos últimos 30 dias
[
  { "id": 7,  "nome": "Maria Silva",  "email": "maria@email.com",  "role": "ALUNO" },
  { "id": 15, "nome": "João Santos", "email": "joao@email.com",   "role": "ALUNO" }
]
```

---

## Testes de Segurança

A API é coberta por **31 testes de segurança automatizados** que verificam o comportamento do sistema contra as principais ameaças do [OWASP Top 10](https://owasp.org/www-project-top-ten/). Os testes rodam com banco de dados H2 em memória — sem dependência de PostgreSQL.

```bash
mvn test
```

### Categorias de Teste

| Classe | Casos | Cobertura |
|---|---|---|
| `AuthenticationSecurityTest` | 8 | SQL Injection, XSS, campos inválidos, enumeração de usuários |
| `JwtSecurityTest` | 8 | Token ausente, malformado, adulterado, expirado, forjado com chave errada |
| `AuthorizationSecurityTest` | 7 | RBAC por perfil, controle de acesso por proprietário dos dados |
| `InputValidationSecurityTest` | 8 | Campos nulos, JSON malformado, type confusion, strings extremas, range de parâmetros |

### OWASP Top 10 — Cobertura

| ID | Categoria | Status |
|---|---|---|
| A01 | Broken Access Control | Coberto — RBAC e controle por proprietário dos dados |
| A03 | Injection | Coberto — SQL Injection e XSS no endpoint de autenticação |
| A07 | Identification and Authentication Failures | Coberto — força bruta, enumeração, JWT attacks |
| A08 | Software and Data Integrity Failures | Coberto — JWT tampering e token forgery |

---

## Como Executar

### Pré-requisitos

- Java 17+
- Maven 3.8+
- PostgreSQL 15+ (ou Docker)

### 1. Clone o repositório

```bash
git clone https://github.com/christiandrades/academia-da-saude.git
cd academia-da-saude
```

### 2. Suba o banco de dados

**Opção A — Docker (recomendado):**

```bash
docker run --name postgres-academia \
  -e POSTGRES_DB=academia_saude \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:15
```

**Opção B — PostgreSQL local:**

```sql
CREATE DATABASE academia_saude;
```

### 3. Configure as variáveis de ambiente (opcional)

Por padrão, a aplicação usa as configurações do `application.yml`. Em produção, defina:

```bash
export JWT_SECRET=sua-chave-secreta-de-pelo-menos-256-bits
```

### 4. Execute a aplicação

```bash
mvn spring-boot:run
```

A API estará disponível em `http://localhost:8080`.

### 5. Execute os testes

```bash
mvn test
```

---

## Variáveis de Configuração

| Variável | Padrão | Descrição |
|---|---|---|
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/academia_saude` | URL do banco de dados |
| `spring.datasource.username` | `postgres` | Usuário do banco |
| `spring.datasource.password` | `postgres` | Senha do banco |
| `jwt.secret` | *(valor padrão inseguro)* | Chave de assinatura JWT — **troque em produção** |
| `jwt.expiration` | `86400000` | Expiração do token em ms (padrão: 24h) |

---

## Desafios Técnicos

### Segurança com Spring Security + JWT

Integrar o Spring Security com autenticação stateless (sem sessão) exigiu configurar manualmente a cadeia de filtros: desabilitar CSRF, configurar `SessionCreationPolicy.STATELESS` e inserir o `JwtFilter` antes do filtro padrão de autenticação. O `Usuario` implementa `UserDetails` diretamente, eliminando a necessidade de uma classe de adaptador separada.

### Query de Faltosos com JPQL

Identificar alunos sem nenhuma presença em um período exigiu uma query com agregação condicional:

```sql
SELECT f.usuario.id FROM Frequencia f
WHERE f.dataHora >= :desde
GROUP BY f.usuario.id
HAVING SUM(CASE WHEN f.statusPresenca = true THEN 1 ELSE 0 END) = 0
```

A estratégia de buscar primeiro apenas os IDs e depois carregar os usuários em uma segunda query evita joins desnecessários e mantém a query de agregação leve.

### Gamificação Auditável

A separação da pontuação em uma tabela própria (`tb_pontuacao`) em vez de um simples contador no cadastro do usuário garante rastreabilidade completa: é possível saber exatamente quando cada ponto foi ganho, o que permite futuras regras mais complexas (pontos por sequência de presenças, bonificações etc.) sem alterar a estrutura do banco.

---

## Roadmap

- [ ] Testes unitários e de integração (JUnit 5 + Mockito)
- [ ] Endpoint de cadastro de usuários
- [ ] Regras avançadas de pontuação (sequência de presenças, bônus mensal)
- [ ] Integração com IA para mensagens motivacionais personalizadas
- [ ] Sistema de notificações (e-mail / SMS)
- [ ] Exportação de relatórios (PDF / Excel)
- [ ] Deploy em cloud (AWS / Railway)
- [ ] Documentação interativa com Swagger/OpenAPI

---

## Autor

**Christian De Andrade**
Desenvolvedor Backend Java | Ex-Coordenador de Programas de Saúde Pública

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Christian_De_Andrade-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/christiandrades/)
[![GitHub](https://img.shields.io/badge/GitHub-christiandrades-181717?style=flat-square&logo=github)](https://github.com/christiandrades)

---

## Licença

Projeto desenvolvido para fins educacionais e de portfólio.
