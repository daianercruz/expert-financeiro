# Expert Financeiro

Assistente financeiro em formato de chat que permite consultar contas,
saldos, transações e gastos por categoria usando dados fictícios do
Plaid Sandbox e respostas em linguagem natural com o Google Gemini.

> Projeto educacional. Os dados são fictícios e nenhuma movimentação
> financeira real é realizada.

## Sobre o projeto

O Expert Financeiro apresenta uma experiência de aplicativo bancário
centrada na conversa. O usuário consulta seus dados por atalhos visuais
ou envia perguntas ao assistente.

O cenário escolhido é um aplicativo financeiro próprio: o cliente encontra
suas contas, seu histórico de transações e o assistente na mesma interface.

O projeto foi desenvolvido do zero, com orientação do Codex e implementação
incremental, mantendo o histórico das alterações em commits no GitHub.

**Status:** funcional em ambiente local, sem publicação em hospedagem.

## Funcionalidades

- Consulta de contas e saldos em cartões.
- Identificação de saldos devedores de cartões e empréstimos.
- Listagem das dez transações mais recentes do período consultado.
- Consulta paginada das transações dos últimos 30 dias.
- Resumo de saídas por categoria com barras comparativas.
- Perguntas em linguagem natural respondidas pelo Gemini.
- Indicação da fonte e do uso de dados fictícios.
- Estados de carregamento e mensagens de erro.
- Espera automática quando as transações do Sandbox ainda estão em preparação.
- Histórico de mensagens durante a sessão.
- Limpeza da conversa e rolagem automática.
- Interface responsiva.
- Limites de requisições na API.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React, Vite, CSS e Lucide React |
| Backend | Node.js, Express e dotenv |
| Dados financeiros | Plaid Sandbox e SDK oficial da Plaid |
| Inteligência artificial | Google Gemini e SDK `@google/genai` |
| Ferramentas de desenvolvimento | Codex, MCP da Pluggy e MCP da Plaid |
| Versionamento | Git e GitHub |

## Arquitetura

```text
Navegador
   │
   ▼
Frontend React
   │
   ▼
API Express
   ├── Plaid Sandbox → contas, saldos e transações fictícias
   ├── Serviço de cálculo → resumo das saídas por categoria
   └── Gemini → interpretação da pergunta e resposta em texto
```

### Papel dos MCPs

Os servidores MCP foram configurados no Codex como ferramentas de apoio
ao desenvolvimento:

- **Pluggy:** consulta à documentação sobre integração financeira brasileira.
- **Plaid:** consulta à documentação e ferramentas de apoio ao Sandbox.

Na implementação atual, o aplicativo consulta a Plaid diretamente pelo SDK.
O backend também chama o Gemini diretamente. Os MCPs configurados no Codex
não são usados automaticamente pelo aplicativo.

## Origem e interpretação dos dados

| Informação | Origem |
|---|---|
| Contas e tipos de conta | Plaid Sandbox |
| Saldos atuais e disponíveis | Plaid Sandbox, via `/accounts/get` |
| Transações e categorias | Plaid Sandbox, via `/transactions/get` |
| Totais por categoria | Calculados pelo backend |
| Explicações em linguagem natural | Gemini, com os dados enviados pelo backend |
| Referência sobre a integração brasileira | Documentação da Pluggy consultada no Codex |

Os saldos retornados por `/accounts/get` são os disponíveis na resposta
da Plaid, sem uma consulta específica de atualização de saldo.

### Regras financeiras

- Valor positivo de transação representa saída.
- Valor negativo representa entrada ou crédito, como um estorno.
- Saldo disponível não informado não é convertido em zero.
- Cartões e empréstimos são apresentados como dívida.
- Investimentos não são tratados como dinheiro disponível.
- Moedas diferentes são mantidas separadas.
- Não há conversão automática para reais.

## Melhoria implementada: análise por categoria

O backend agrupa as saídas por categoria e moeda. O frontend apresenta os
resultados em barras comparativas, com total e período consultado.

O cálculo:

1. Considera valores positivos e transações não pendentes.
2. Exige categoria e moeda informadas.
3. Exclui `TRANSFER_IN`, `TRANSFER_OUT`, `LOAN_PAYMENTS` e `INCOME`.
4. Soma os valores em centavos.
5. Ordena os resultados por moeda e total.

O resultado representa **saídas brutas**, sem descontar estornos.
A exclusão depende da classificação retornada pela Plaid; não há
conciliação entre contas.

O cálculo em centavos foi testado para valores em USD e BRL.
Moedas com outras convenções decimais exigem adaptação.

## Estrutura do projeto

```text
expert-financeiro/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── gemini.js
│   │   │   └── plaid.js
│   │   ├── routes/
│   │   │   ├── chat.js
│   │   │   └── sandbox.js
│   │   ├── scripts/
│   │   │   ├── test-gemini.js
│   │   │   └── test-plaid.js
│   │   ├── services/
│   │   │   ├── chat.js
│   │   │   ├── sandbox.js
│   │   │   ├── spending.js
│   │   │   └── spending.test.js
│   │   └── server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccountsSummary.jsx
│   │   │   ├── SpendingSummary.jsx
│   │   │   └── TransactionsTable.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
├── .env.example
├── .gitignore
└── readme.md
```

## Executar localmente

### Pré-requisitos

- Node.js 24 e npm.
- Credenciais do Plaid Sandbox.
- Chave da API do Gemini.
- Git para clonar o projeto.

### 1. Clonar o repositório

```bash
git clone https://github.com/daianercruz/expert-financeiro.git
cd expert-financeiro
```

### 2. Instalar as dependências

Execute na raiz:

```bash
npm --prefix backend ci
npm --prefix frontend ci
```

### 3. Configurar o ambiente

Crie `backend/.env`:

```env
PORT=3001
PLAID_CLIENT_ID=
PLAID_SECRET=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
```

Preencha as credenciais localmente. Use somente o secret de Sandbox
da Plaid.

O modelo do Gemini pode ser ajustado conforme a disponibilidade da conta.

### 4. Iniciar o backend

Em um terminal:

```bash
cd backend
npm run dev
```

### 5. Iniciar o frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

Abra o endereço informado pelo Vite, normalmente
`http://localhost:5173`.

O proxy de desenvolvimento encaminha as chamadas de `/api` para
o backend na porta 3001.

### Executar pelo mesmo servidor

Também é possível acessar o frontend compilado pelo Express.

Na raiz, gere o build:

```bash
npm --prefix frontend run build
```

Depois inicie o backend:

```bash
cd backend
npm start
```

Abra `http://localhost:3001`.

Alterações no frontend exigem um novo build para aparecer nesse endereço.

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Verifica o servidor |
| POST | `/api/sandbox/initialize` | Inicializa o Item fictício |
| GET | `/api/sandbox/accounts` | Consulta contas e saldos |
| GET | `/api/sandbox/transactions` | Consulta transações dos últimos 30 dias |
| GET | `/api/sandbox/spending` | Retorna as saídas por categoria |
| POST | `/api/chat` | Responde à pergunta usando o Gemini |

As consultas diretas ao Sandbox exigem inicialização prévia.
A interface faz essa inicialização ao usar os atalhos, e a rota
do chat também a realiza quando necessário.

Exemplo de corpo para `/api/chat`:

```json
{
  "question": "Qual categoria teve a maior saída no período?"
}
```

O token do Item permanece somente na memória do backend.
Após reiniciar o servidor, uma nova inicialização é necessária.

## Caminho de uma resposta

Exemplo: “Qual categoria teve a maior saída no período?”

1. O frontend envia a pergunta para `POST /api/chat`.
2. O backend inicializa o Sandbox, se necessário.
3. Consulta contas e todas as páginas de transações do período.
4. Calcula o resumo por categoria.
5. Envia ao Gemini a pergunta, os dados selecionados e as regras de resposta.
6. Retorna o texto ao frontend com identificação da fonte.

O Gemini recebe até 100 transações recentes como contexto.
O resumo por categoria usa todas as transações recuperadas na consulta.

Os atalhos de saldo, categorias e transações acessam as rotas específicas
e mostram componentes estruturados sem depender do Gemini.

## Configuração dos servidores MCP

### Pluggy

No cliente de IA com suporte a MCP, adicione:

| Campo | Valor |
|---|---|
| Nome | `pluggy` |
| Transporte | Streamable HTTP |
| URL | `https://mcp.pluggy.ai/mcp` |
| Autenticação para documentação | Sem chave |

Teste solicitando uma explicação sobre o conceito de Item, com fontes.

A autenticação da conta Pluggy é distinta do acesso anônimo à documentação.

### Plaid

Instale o `uv`, que fornece o comando `uvx`.

No Windows, pelo PowerShell:

```powershell
winget install --id=astral-sh.uv -e
```

Em um novo terminal, descubra o caminho:

```powershell
(Get-Command uvx).Source
```

Configure o servidor no cliente de IA:

| Campo | Valor |
|---|---|
| Nome | `plaid` |
| Transporte | STDIO |
| Comando | Caminho absoluto do `uvx` |
| Argumento | `mcp-server-plaid` |
| Variáveis de ambiente | `PLAID_CLIENT_ID` e `PLAID_SECRET` de Sandbox |

Preencha os valores somente na configuração local.
O `.env` do backend não é carregado automaticamente pelo cliente MCP.

A conexão foi verificada pela disponibilidade das ferramentas e por
uma consulta de documentação. Isso não equivale a validar todas as
operações autenticadas do servidor MCP.

## Testes e validação

Na raiz do projeto, execute os testes de cálculo:

```bash
node --test backend/src/services/spending.test.js
```

Os testes cobrem agrupamento de saídas, exclusões, separação de moedas
e soma de centavos.

Dentro de `backend`, execute os testes manuais das integrações:

```bash
npm run test:plaid
node src/scripts/test-gemini.js
```

O teste da Plaid cria um novo Item a cada execução.
O teste do Gemini faz uma chamada à API e está sujeito às cotas da conta.

Para verificar a compilação do frontend, execute na raiz:

```bash
npm --prefix frontend run build
```

Também foram realizadas verificações manuais dos cartões, tabelas,
barras, envio de perguntas, limpeza da conversa e layout em largura
de celular.

## Especificação e ajustes durante o desenvolvimento

O projeto foi implementado com orientação do Codex, sem uso do Lovable.

A especificação adotada foi construir um chat financeiro com React,
backend Express, dados fictícios da Plaid e respostas do Gemini,
mantendo as credenciais no servidor e identificando as fontes.

Durante a implementação foram adicionados:

- Paginação das transações.
- Espera automática pelo processamento do Sandbox.
- Cálculos por categoria com testes.
- Cartões de saldo e tabela de transações.
- Respostas em português e texto simples.
- Rolagem automática do chat.
- Serviço do frontend compilado pelo backend.
- Limites de requisições.

## Segurança e limitações

- Credenciais ficam no backend e são ignoradas pelo Git.
- O frontend não recebe chaves nem tokens de acesso.
- Dados fictícios selecionados são enviados ao Gemini nas perguntas livres.
- A API limita chamadas por IP: 60 por minuto na API e 10 perguntas
  em 15 minutos no chat.
- Os contadores ficam na memória e reiniciam com o processo.
- O aplicativo não possui autenticação nem separação de dados por usuário.
- O Item de demonstração é compartilhado pelo processo do servidor.
- O histórico fica na interface; perguntas anteriores não são enviadas à IA.
- Respostas da IA podem conter erros e devem ser conferidas.
- A versão atual é destinada à execução local, sem hospedagem publicada.
- A Plaid Sandbox não representa uma integração de Open Finance brasileiro
  em produção.

## Evidências

As etapas foram verificadas durante o desenvolvimento com:

- Tabelas de contas e saldos no terminal.
- Consulta das transações e resumo por categoria.
- Respostas das rotas HTTP.
- Cartões, barras e tabela no frontend.
- Perguntas respondidas pelo Gemini.
- Consulta documental pelos servidores MCP.

Os prints ainda precisam ser organizados no repositório.
Nenhuma evidência deve expor credenciais ou tokens.

## Referências

- [Documentação da Plaid](https://plaid.com/docs/)
- [Servidor MCP oficial da Plaid](https://github.com/plaid/ai-coding-toolkit/tree/main/sandbox)
- [Documentação e MCP da Pluggy](https://mcp.pluggy.ai/en/mcp)
- [Documentação do Gemini](https://ai.google.dev/gemini-api/docs)
- [Instalação do uv](https://docs.astral.sh/uv/getting-started/installation/)

