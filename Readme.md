# PetCare

Uma experiência digital completa para um pet shop fictício. O projeto vai além de uma landing page: apresenta serviços dinamicamente e oferece um fluxo de agendamento em quatro etapas, com confirmação pelo WhatsApp.

## Funcionalidades

- Catálogo dinâmico com seis serviços
- Filtros por Estética, Saúde e Bem-estar
- Agendamento guiado em quatro etapas
- Seleção de serviço, dados do pet, data e horário
- Resumo completo antes da confirmação
- Persistência dos agendamentos no `localStorage`
- Mensagem de confirmação formatada para WhatsApp
- Menu mobile acessível
- FAQ interativo
- Animações com suporte a `prefers-reduced-motion`
- Feedback integrado e validação de formulário
- Layout responsivo para celular, tablet e desktop
- SEO básico e metadados Open Graph

## Tecnologias

- HTML5 semântico
- CSS3 com Grid, Flexbox e propriedades personalizadas
- JavaScript puro
- Web Storage API
- Web Share via link do WhatsApp

## Como executar

Não há dependências ou etapa de build.

1. Clone ou baixe o projeto.
2. Abra `index.html` no navegador.

## Configuração do WhatsApp

Antes de publicar, altere a constante `WHATSAPP_NUMBER` no início de `script.js`:

```js
const WHATSAPP_NUMBER = '5511999999999';
```

Use o código do país e DDD, apenas com números.

> Os contatos, endereço, valores, horários e depoimentos são demonstrativos e devem ser substituídos pelos dados reais do negócio.

## Estrutura

```text
PetCare/
├── index.html
├── style.css
├── script.js
└── Readme.md
```

## Autor

Desenvolvido por Gustavo Gomes.
