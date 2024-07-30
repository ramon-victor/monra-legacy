# Monra - Código Legado

Este é o código legado da Monra, uma IA criada para participar de conversas privadas e grupos no WhatsApp.

## Conteúdo
- [Requisitos](#requisitos)
- [Instruções](#instruções)
- [Comandos](#comandos)
- [APIs Gratuitas](#apis-gratuitas)

## Instalando

### Requisitos

- Node 18+;
- 2GB RAM, 2 Core CPU.

### Instruções

1. **Criando o .env**  
   Faça uma cópia do `.env.example` e renomeie-o para `.env`.  
   Altere as informações do `.env`. As alterações mais importantes são:

   ```env
   # WhatsApp
   Nome que o bot responderá no WhatsApp
   BOT_NAME=Monra

   # OpenAI
   Informações da API da OpenAI. Você pode alterar a API_BASE e utilizar, inclusive, APIs gratuitas. Exemplo:
   OPENAI_API_KEY=shuttle-api-key-exemplo
   OPENAI_API_BASE=https://api.shuttleai.app/v1
   MODEL=shuttle-2.5
   FALLBACK_MODEL=shuttle-2.5-mini

2. **Instalando as Dependências**  
   Garanta que o Node 18+ e NPM estejam instalados e execute `npm install`.

3. **Executando o Código**  
   Execute o código do bot com `npm start`.

4. **Autenticando o WhatsApp**  
   Deverá aparecer um QR Código no terminal. Use-o para conectar o WhatsApp onde deseja rodar o bot.

### Comandos

- `/fig` = Transforma imagem em figurinha;
- `/img` = Transforma figurinha em imagem;
- `/escreva` = Transcreve áudios e vídeos;
- `/reseta` = Esquece as mensagens anteriores do chat e reseta o contexto do bot.

### APIs Gratuitas
Algumas provedoras de LLM com planos gratuitos. Alguns incluindo gpt-4. 
- [Shuttleai](https://shuttleai.app/)
- [Naga](https://naga.ac/)
