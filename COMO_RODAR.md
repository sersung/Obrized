# BuildrAI — Como Rodar o Projeto

## Pré-requisitos

1. **Node.js** (versão 18 ou superior)
   - Baixe em: https://nodejs.org/
   - Instale o instalador Windows (.msi)
   - Verifique a instalação: `node --version`

2. **Chave de API Anthropic** (Claude AI)
   - Crie uma conta em: https://console.anthropic.com
   - Vá em "API Keys" e crie uma nova chave
   - Copie a chave (começa com `sk-ant-...`)

## Configuração

1. Abra a pasta `buildr-ai` no terminal (PowerShell ou CMD)
2. Edite o arquivo `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-SUA_CHAVE_AQUI
   ```

## Instalação e Execução

```bash
# 1. Instale as dependências
npm install

# 2. Rode o servidor de desenvolvimento
npm run dev

# 3. Acesse no navegador
# http://localhost:3000
```

## Módulos da Plataforma

| Módulo | Rota | Funcionalidade |
|--------|------|----------------|
| Landing Page | `/` | Apresentação do produto |
| Dashboard | `/dashboard` | Visão geral, projetos ativos, alertas |
| Orçamentação | `/estimating` | Lista de orçamentos |
| Novo Orçamento | `/estimating/new` | Upload de planta → IA extrai quantitativos |
| Contratos | `/contracts` | Lista de contratos analisados |
| Novo Contrato | `/contracts/new` | Upload de PDF → IA analisa riscos CCDC |
| Segurança | `/safety` | Lista de relatórios de segurança |
| Novo Relatório | `/safety/new` | Voz/texto → IA gera relatório estruturado |
| Cronograma | `/scheduling` | Gantt com recalculação por IA |
| Pagamentos | `/payments` | Relógio de 28 dias, Prompt Payment |
| Nova Fatura | `/payments/new` | Geração de proper invoice com validação |

## APIs de IA

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/estimating/extract` | POST | Extração de quantitativos via Claude Vision |
| `/api/contracts/analyze` | POST | Análise de risco contratual CCDC |
| `/api/safety/generate` | POST | Geração de relatório de segurança |
| `/api/scheduling/optimize` | POST | Recalculação de cronograma |
| `/api/payments/validate` | POST | Validação de proper invoice |

## Dicas de Uso

- **Orçamentação**: Faça upload de plantas em PDF (até 50MB). A IA usa Claude Vision para 
  extrair quantitativos automaticamente.
  
- **Contratos**: Envie qualquer contrato CCDC. A IA conhece os padrões CCDC-2, CCDC-5A, 
  CCDC-5B, CCDC-17 e CCA-1 e identifica desvios.
  
- **Segurança**: Fale naturalmente no microfone ou escreva notas informais. A IA estrutura 
  conforme OHSA/WorkSafeBC automaticamente.
  
- **Cronograma**: Registre atrasos e a IA recalcula todo o cronograma respeitando dependências.
  
- **Pagamentos**: A IA valida se sua fatura atende aos requisitos de "proper invoice" da 
  legislação de Prompt Payment de Ontario ou BC.

## Tecnologias Utilizadas

- **Next.js 15** — Framework React com App Router
- **TypeScript** — Tipagem estática
- **Tailwind CSS** — Estilização
- **Claude Sonnet 4.6** — IA para todas as funcionalidades
- **Anthropic SDK** — Integração com a API do Claude
- **React Dropzone** — Upload de arquivos
- **Sonner** — Notificações
- **date-fns** — Manipulação de datas
- **Lucide React** — Ícones

## Financiamento Disponível

Para PMEs canadenses que queiram adoptar esta tecnologia:
- **CDAP**: Até $15.000 em subsídios + empréstimos a 0% via BDC
- **RAII**: Até 50% dos custos de implementação
- **SR&ED**: Crédito fiscal para desenvolvimento interno
- **AI Compute Access Fund**: $300M disponível para PMEs
