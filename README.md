# ONG Vida Plena — Sistema de Gestão

Sistema no-code/low-code para gestão de beneficiários, eventos e inscrições da ONG Vida Plena (Teresina-PI).
Desenvolvido como trabalho acadêmico na **UniFECAF** — disciplina *Aplicações Visuais com Plataformas No-Code e Low-Code*.

**Acesse em produção:** [jessicahelem.github.io/ong-vida-plena](https://jessicahelem.github.io/ong-vida-plena/)

---

## Sobre o projeto

A ONG Vida Plena (case fictício) realiza eventos de inclusão digital, capacitação profissional e campanhas de saúde para comunidades da periferia de Teresina. Este sistema permite:

- Cadastrar beneficiários e vinculá-los a eventos com um formulário público
- Confirmar presença via link enviado por e-mail automaticamente
- Acompanhar métricas em tempo real no Dashboard
- Gerenciar eventos, inscrições e presença pelo painel admin

---

## Tecnologias utilizadas

| Camada | Tecnologia | Motivo da escolha |
|--------|-----------|-------------------|
| Frontend | HTML5 + CSS3 + JavaScript puro | Sem dependência de build, compatível com GitHub Pages |
| Banco de dados | [Airtable](https://airtable.com) | Interface visual, API REST nativa, relacionamentos entre tabelas |
| Automação | [Make.com](https://make.com) | Fluxos visuais, webhook, conectores prontos para Airtable e Gmail |
| E-mail | Gmail via Make.com | Integração nativa, sem configuração de SMTP |
| Hospedagem | [GitHub Pages](https://pages.github.com) | CI/CD automático a cada push, gratuito |

---

## Estrutura do projeto

```
ong-vida-plena/
├── index.html          ← SPA com todas as páginas
├── css/
│   └── style.css       ← Todos os estilos
├── js/
│   ├── config.js       ← Credenciais e constantes (único arquivo a alterar)
│   ├── api.js          ← Funções de acesso ao Airtable e webhook
│   ├── utils.js        ← Utilitários (formatação, toast, barras de progresso)
│   ├── nav.js          ← Navegação SPA entre páginas
│   ├── auth.js         ← Login/logout do painel admin
│   ├── eventos.js      ← Página pública de eventos
│   ├── inscricao.js    ← Formulário de inscrição com busca por CPF
│   └── modulos.js      ← Beneficiários, Inscrições, Dashboard, Admin Eventos
└── README.md
```

---

## Banco de dados — Airtable

O Airtable funciona como banco de dados relacional visual com três tabelas interligadas:

### Tabela: Beneficiários
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Nome Completo | Single line text | Nome do participante |
| CPF | Single line text | Usado para busca e identificação única |
| Idade | Number | Para análise de faixa etária |
| Telefone | Single line text | Contato |
| Email | Email | Destino do e-mail de confirmação |
| Região | Single select | Zona de Teresina (Norte, Sul, Leste, Sudeste, Centro) |
| Bairro | Single line text | Bairro de residência |
| Observações | Long text | Campo livre |
| Inscrições | Link to Inscrições | Relacionamento com a tabela Inscrições |

### Tabela: Eventos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Nome do Evento | Single line text | Título do evento |
| Data do Evento | Date | Data de realização |
| Local | Single line text | Endereço ou local |
| Tipo | Single select | Inclusão Digital / Capacitação Profissional / Campanha de Saúde / Outro |
| Vagas | Number | Capacidade total |
| Status | Single select | Planejado / Em andamento / Concluído / Cancelado |
| Descrição | Long text | Detalhes do evento |
| Inscrições | Link to Inscrições | Relacionamento com a tabela Inscrições |

### Tabela: Inscrições
| Campo | Tipo | Descrição |
|-------|------|-----------|
| ID da Inscrição | Single line text | Identificador único (ex: INS-12345678) |
| Data da Inscrição | Date | Data em que a inscrição foi feita |
| Status da Inscrição | Single select | Confirmada / Pendente / Cancelada |
| Presença | Single select | Presente / Ausente / Aguardando |
| Beneficiários | Link to Beneficiários | Quem se inscreveu |
| Eventos | Link to Eventos | Em qual evento |
| Observações | Long text | Campo livre |

---

## Automação — Make.com

O cenário **"ONG Vida Plena — Hub Completo"** recebe requisições via webhook e processa dois fluxos pelo mesmo endpoint:

### Rota A — Nova inscrição (POST com `tipo = "inscricao"`)

```
Webhook recebe os dados
    │
    ├─→ Cria registro em Inscrições (Status: Pendente, Presença: Aguardando)
    │
    ├─→ Envia e-mail Gmail com botões Confirmar / Cancelar
    │   (link contém o Airtable record ID da inscrição)
    │
    └─→ Router: beneficiário novo ou existente?
            ├─ Existente → Atualiza Inscrição vinculando o beneficiário
            └─ Novo      → Cria Beneficiário → Atualiza Inscrição vinculando
```

### Rota B — Confirmação por e-mail (GET com `tipo = "confirmacao"`)

```
Beneficiário clica no link do e-mail
    │
    ├─→ Atualiza Status da Inscrição (Confirmada ou Cancelada)
    │   usando o Airtable record ID direto (sem busca intermediária)
    │
    └─→ Retorna página HTML de feedback ("Presença confirmada!" ou "Inscrição cancelada")
```

> **Nota técnica:** O Airtable record ID (`recXXXXX`) é embutido no link do e-mail no momento da criação da inscrição, eliminando a necessidade de busca por texto e evitando problemas de encoding com caracteres acentuados.

---

## Funcionalidades

### Área pública (sem login)

| Página | O que faz |
|--------|-----------|
| **Eventos** | Lista todos os eventos com contagem regressiva, tipo, vagas e descrição |
| **Inscrever-se** | Busca pelo CPF → preenche dados automaticamente se cadastrado → lista eventos com status de cada inscrição |
| **Dashboard** | Métricas em tempo real: inscrições por status, presença, vagas disponíveis, gráficos por evento / zona / faixa etária |

### Área admin (senha: `ong2025`)

| Página | O que faz |
|--------|-----------|
| **Beneficiários** | Lista com busca, filtro por zona, CPF e botão "Ver eventos" com popup de histórico |
| **Inscrições** | Tabela completa com filtros, botões Presente/Ausente e exportação em CSV |
| **Gerenciar Eventos** | Criar e editar eventos diretamente no Airtable via interface do sistema |

---

## Como rodar localmente

> Não abra o `index.html` direto no navegador — as chamadas ao Airtable falham por CORS sem um servidor HTTP.

**Opção 1 — Node.js:**
```bash
npx serve .
# Acesse: http://localhost:3000
```

**Opção 2 — Python:**
```bash
python -m http.server 8080
# Acesse: http://localhost:8080
```

**Opção 3 — VS Code:** Instale a extensão **Live Server** → clique com botão direito no `index.html` → *Open with Live Server*

---

## Configuração para replicar

Caso queira rodar com sua própria base no Airtable:

1. Crie uma base no Airtable com as três tabelas descritas acima
2. Gere um Personal Access Token em **airtable.com → Account → Developer Hub**
3. Crie um cenário no Make.com seguindo o fluxo da seção anterior
4. Edite `js/config.js`:

```js
const CONFIG = {
  AIRTABLE_TOKEN: 'pat...',              // seu token
  AIRTABLE_BASE:  'appXXXXXXXXXXXXXX',  // ID da sua base
  WEBHOOK_URL:    'https://hook.us2.make.com/...',  // URL do seu webhook
  ADMIN_SENHA:    'suasenha',
};
```

5. Faça push para o GitHub e ative o GitHub Pages no repositório

---

## CPFs de demonstração

| Beneficiário | CPF | Zona |
|---|---|---|
| Maria das Graças | 111.222.333-44 | Zona Leste |
| João Carlos | 222.333.444-55 | Zona Norte |
| Ana Lúcia | 333.444.555-66 | Zona Sul |
| Roberto Lima | 444.555.666-77 | Centro |
| Cláudia Souza | 555.666.777-88 | Zona Sudeste |

---

## Segurança e limitações

- O token do Airtable está exposto no arquivo `js/config.js` — limitação inerente a sites estáticos sem backend
- Em produção real, recomenda-se um proxy server-side (ex: Cloudflare Workers ou Netlify Functions) para ocultar as credenciais
- O painel admin é protegido por senha no frontend — não é uma autenticação robusta, mas suficiente para o escopo acadêmico

---

## Contexto acadêmico

**Aluna:** Jessica Santos  
**Instituição:** UniFECAF  
**Curso:** Tecnologia em Análise e Desenvolvimento de Sistemas  
**Disciplina:** Aplicações Visuais com Plataformas No-Code e Low-Code  
**Projeto:** Case study — ONG Vida Plena (Teresina-PI) — 2025
