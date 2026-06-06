# ONG Vida Plena — Sistema de Gestão

Sistema no-code/low-code para gestão de eventos, inscrições e beneficiários da ONG Vida Plena, Teresina-PI.

Desenvolvido como trabalho acadêmico na **UniFECAF** — disciplina de Aplicações Visuais com Plataformas No-Code e Low-Code.

---

## 🚀 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 + CSS3 + JavaScript puro |
| Banco de dados | [Airtable](https://airtable.com) |
| Automação | [Make.com](https://make.com) |
| E-mail | Gmail via Make.com |
| Hospedagem | [Netlify](https://netlify.com) |

---

## 📁 Estrutura do projeto

```
ong-vida-plena/
├── index.html          # HTML principal (todas as páginas)
├── css/
│   └── style.css       # Estilos globais
├── js/
│   ├── config.js       # Configurações e credenciais
│   ├── api.js          # Funções de acesso ao Airtable
│   ├── utils.js        # Funções utilitárias
│   ├── nav.js          # Navegação entre páginas
│   ├── auth.js         # Controle de acesso admin
│   ├── eventos.js      # Módulo de eventos públicos
│   ├── inscricao.js    # Módulo de inscrição com CPF
│   └── modulos.js      # Beneficiários, Inscrições, Dashboard, Admin Eventos
└── README.md
```

---

## ⚙️ Configuração

### 1. Airtable

1. Acesse [airtable.com](https://airtable.com) e abra a base **ONG Vida Plena**
2. Vá em **Developer Hub → Personal access tokens**
3. Crie um token com permissões `data.records:read` e `data.records:write`
4. Copie o token (começa com `pat...`)

### 2. Configurar credenciais

Abra o arquivo `js/config.js` e preencha:

```js
const CONFIG = {
  AIRTABLE_TOKEN: 'pat...',          // seu token aqui
  AIRTABLE_BASE:  'appcN28ceiNCeB2GU',
  WEBHOOK_URL:    'https://hook.us2.make.com/...',
  ADMIN_SENHA:    'ong2025',         // altere para produção
};
```

### 3. Publicar no Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Arraste a pasta `ong-vida-plena/` na área de deploy
3. Aguarde o deploy finalizar
4. Acesse a URL gerada

---

## 🗄️ Estrutura do Airtable

### Tabela: Eventos
| Campo | Tipo |
|-------|------|
| Nome do Evento | Single line text |
| Data do Evento | Date |
| Local | Single line text |
| Tipo | Single select |
| Vagas | Number |
| Status | Single select |
| Descrição | Long text |
| Inscrições | Link to Inscrições |

### Tabela: Beneficiários
| Campo | Tipo |
|-------|------|
| Nome Completo | Single line text |
| Idade | Number |
| Telefone | Single line text |
| Email | Email |
| Região | Single select |
| Bairro | Single line text |
| CPF | Single line text |
| Observações | Long text |
| Inscrições | Link to Inscrições |

### Tabela: Inscrições
| Campo | Tipo |
|-------|------|
| ID da Inscrição | Single line text |
| Data da Inscrição | Date |
| Status da Inscrição | Single select (Confirmada, Pendente, Cancelada) |
| Presença | Single select (Presente, Ausente, Aguardando) |
| Eventos | Link to Eventos |
| Beneficiários | Link to Beneficiários |
| Observações | Long text |

---

## 🔄 Fluxo Make.com

O cenário **"ONG Vida Plena — Hub Completo"** processa dois tipos de requisição via Router:

**Rota A — Nova inscrição** (`tipo = inscricao`):
1. Cria beneficiário no Airtable (apenas se for novo)
2. Cria inscrição vinculada ao beneficiário e ao evento
3. Envia e-mail com botões de confirmação/cancelamento

**Rota B — Confirmação por e-mail** (`tipo = confirmacao`):
1. Busca a inscrição pelo ID
2. Atualiza o status (Confirmada ou Cancelada)
3. Retorna página HTML de feedback para o beneficiário

---

## 👤 Funcionalidades

### Público (sem login)
- 📅 **Eventos** — lista com contagem regressiva, tipo e vagas
- 📝 **Inscrever-se** — busca por CPF, preenche dados automaticamente, lista eventos com status
- 📊 **Dashboard** — métricas em tempo real

### Admin (senha: `ong2025`)
- 👥 **Beneficiários** — lista com CPF, bairro, filtros e busca
- 📋 **Inscrições** — tabela com botões de presença, filtros e exportação CSV
- 📅 **Gerenciar Eventos** — criar e editar eventos diretamente no Airtable

---

## 📧 CPFs de teste

| Beneficiário | CPF |
|---|---|
| Maria das Graças | 111.222.333-44 |
| João Carlos | 222.333.444-55 |
| Ana Lúcia | 333.444.555-66 |
| Roberto Lima | 444.555.666-77 |
| Cláudia Souza | 555.666.777-88 |

---

## 📄 Licença

Projeto acadêmico — UniFECAF 2025.
