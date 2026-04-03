# 🏃‍♂️ Sistema de Gestão & Gamificação - Academia da Saúde (SUS)

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Status](https://img.shields.io/badge/Status-MVP-yellow)

## 📖 Sobre o Projeto

Solução desenvolvida para preencher lacunas do e-SUS na gestão de academias da saúde pública. O sistema combina gamificação para engajamento de usuários com ferramentas de CRM para gestão ativa de frequência.

### 🎯 Problema Identificado

O e-SUS não oferece recursos  adequados para as Academias da Saúde, tais quais:

- Engajamento gamificado de alunos
- Identificação proativa de evasão
- Dashboard gerencial para resgate ativo

### ✨ Solução Implementada

- **Gamificação**: Sistema de pontos baseado em assiduidade
- **Resgate Ativo**: Dashboard CRM para servidores identificarem alunos faltosos
- **Controle de Acesso**: Perfis ALUNO e SERVIDOR com permissões diferenciadas
- **Feedback Inteligente**: Mensagens motivacionais personalizadas

---

## 🛠️ Stack Tecnológica

### Backend

- Java 17
- Spring Boot 3.2
- Spring Data JPA
- Spring Security (JWT)
- PostgreSQL

### Qualidade

- JUnit 5 & Mockito
- Validação com Bean Validation

---

## 🗄️ Modelagem de Dados

```sql
tb_usuarios
├── id (PK)
├── nome
├── email
├── senha (hash)
└── role (ENUM: ALUNO, SERVIDOR)

tb_frequencia (1:N com usuarios)
├── id (PK)
├── usuario_id (FK)
├── data_hora
└── status_presenca

tb_pontuacao
├── id (PK)
├── usuario_id (FK)
├── pontos
└── motivo
```

### Decisões Técnicas

- PostgreSQL escolhido pela integridade referencial em queries de relatório
- Uso de ENUM para roles evita necessidade de tabela adicional
- Índices em `usuario_id` e `data_hora` para otimizar dashboard

---

## 🚀 Como Executar

### Pré-requisitos

```bash
Java 17+
Maven 3.8+
PostgreSQL 15+ (ou Docker)
```

### Passo a Passo

### 1. Clone o repositório

```bash
git clone https://github.com/christiandrades/academia-saude-backend.git
cd academia-saude-backend
```

### 2. Configure o banco de dados

Opção A - Docker (recomendado):

```bash
docker run --name postgres-academia \
  -e POSTGRES_DB=academia_saude \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:15
```

Opção B - PostgreSQL local:

```sql
CREATE DATABASE academia_saude;
```

### 3. Execute a aplicação

```bash
mvn spring-boot:run
```

A API estará disponível em: `http://localhost:8080`

### 🧪 Executar Testes

```bash
mvn test
```

---

## 📡 Endpoints Principais

```http
POST   /api/auth/login          # Autenticação
POST   /api/frequencias         # Registrar presença (SERVIDOR)
GET    /api/frequencias/{id}    # Consultar frequências
GET    /api/dashboard/faltosos  # Listar alunos faltosos (SERVIDOR)
GET    /api/pontuacao/{id}      # Consultar pontuação do aluno
```

### Exemplo de requisição

```json
"POST" "/api/frequencias"
{
  "usuarioId": 1,
  "statusPresenca": true
}
```

---

## 🎓 Aprendizados e Desafios Técnicos

### Desafio 1: Modelagem de Segurança

Implementação de RBAC diferenciando alunos (consulta) de servidores (gestão completa) usando Spring Security.

### Desafio 2: Performance em Relatórios

Otimização de queries com índices compostos para dashboard de faltosos (10k+ registros).

### Desafio 3: Gamificação Auditável

Criação de log de pontuação separado para rastreabilidade das regras de negócio.

---

## 🔜 Roadmap

- [ ] Integração com API de IA para mensagens personalizadas
- [ ] Sistema de notificações (email/SMS)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Deploy em cloud (AWS/Heroku)

---

## 👨‍💻 Autor

**Christian De Andrade**  
Desenvolvedor Backend Java | Ex-Coordenador de Saúde em Transição para Tech

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Christian_De_Andrade-blue)](https://www.linkedin.com/in/christiandrades/)

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de portfólio.

---

> 💡 **Contexto Profissional**: Este projeto nasceu da experiência de 16 anos na gestão de programas de saúde pública, onde identifiquei gaps tecnológicos que impactavam a retenção de usuários. A solução combina conhecimento de domínio com stack moderna de backend Java.
