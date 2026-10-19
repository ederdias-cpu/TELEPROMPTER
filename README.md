# Teleprompter Remote — protótipo funcional

Sistema independente inspirado no fluxo simples do CuePrompter. Não contém código ou identidade visual copiados do site.

## Requisitos

- Node.js 18 ou superior (sem dependências de terceiros).
- Computador e celular no mesmo Wi-Fi, ou servidor acessível por ambos.

## Executar

No terminal, dentro desta pasta:

```bash
node server.js
```

No computador, abra `http://localhost:3000` e clique em **Criar teleprompter**. Cole seu texto, abra o monitor e use **Abrir teleprompter em tela cheia**.

No celular, conecte-se ao mesmo Wi-Fi e abra `http://IP_DO_COMPUTADOR:3000` (ex.: `http://192.168.1.50:3000`). Use **Usar como controle remoto** e digite o código de seis dígitos mostrado no computador. Também é possível abrir diretamente o link de controle da sessão, substituindo `localhost` pelo IP do computador.

Para descobrir o IP no Windows: abra o Prompt de Comando e execute `ipconfig`; procure o endereço IPv4 do Wi-Fi. Talvez seja necessário liberar a porta TCP 3000 no Firewall do Windows.

## Funções

- Editor de roteiro com rascunho salvo localmente no navegador do computador.
- Rolagem contínua por velocidade de pixels/segundo usando `requestAnimationFrame`.
- Controle remoto em tempo real via HTTP + Server-Sent Events (SSE), incluindo iniciar, pausar, acelerar, avançar, voltar e ir ao começo.
- Fonte, entrelinha, margens, espelhamento horizontal/vertical e cores.
- Tela cheia e atalhos: espaço para pausar, setas cima/baixo para velocidade, Esc para sair.
- Salas temporárias com código de 6 dígitos. Expiram após 24h de inatividade. Todos que sabem o código podem controlar; use somente em redes confiáveis.

## Observações e limitações

- O servidor deve permanecer ligado durante a gravação.
- Controle sem internet funciona quando ambos estão no mesmo Wi-Fi e acessam o servidor local.
- Para acesso entre redes diferentes é necessário hospedar o Node.js em um servidor HTTPS ou usar uma VPN segura; não exponha a porta diretamente sem autenticação.
- Esta é uma primeira versão, sem login, permissões granulares nem QR Code. O link direto já pode ser enviado ao telefone.


## Nova janela de leitura
1. No editor, clique **Gerar roteiro e abrir nova janela**. O navegador pode solicitar autorizacao de pop-ups.
2. A janela independente mostrara so a leitura. Para tela cheia verdadeira, clique no botao **Tela cheia** dentro dela (o navegador exige um gesto do usuario).
3. Arraste essa janela para outro monitor antes de ativar tela cheia.
4. Controle pelo celular pelo link de sala. O editor permanece aberto na janela original.
5. Caso pop-ups estejam bloqueados, use o link **Abrir janela de leitura** presente no editor.

Ao enviar ao GitHub, extraia o ZIP, mantenha `public/` e envie os arquivos na raiz. Render publica automaticamente.
