# Esteira de Edição

Quadro kanban para acompanhar jobs de edição de vídeo (decupagem → recebido → edição → revisão → entregue), com prazo automático de 4 dias úteis a partir do recebimento da decupagem.

É um site estático (HTML/CSS/JS puro, sem build), sincronizado em tempo real entre dispositivos via **Firebase Firestore**, publicado no **GitHub Pages**.

## Configurar o Firebase (obrigatório para sincronizar)

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto novo (pode ser gratuito, plano Spark).
2. No menu lateral, vá em **Firestore Database** → **Criar banco de dados** → escolha uma localização → modo **produção**.
3. Vá em **Authentication** → aba **Sign-in method** → ative os provedores **Anônimo** e **E-mail/senha** (os dois — o anônimo é o que dá acesso de visualização a quem só tem o link, tipo clientes; o e-mail/senha é o login da equipe que edita).
4. Vá em **Configurações do projeto** (ícone de engrenagem) → **Seus apps** → clique no ícone `</>` (Web) para registrar um app.
5. Copie o objeto `firebaseConfig` que aparece.
6. Abra o [index.html](index.html) deste projeto, procure o bloco `CONFIGURAÇÃO DO FIREBASE` (perto do fim do arquivo) e substitua os valores de exemplo pelos que você copiou.
7. Em **Firestore Database → Regras**, cole as regras abaixo. Elas liberam **leitura** pra qualquer pessoa que abra o link (inclusive anônima, ou seja, clientes) mas só liberam **escrita** pra quem estiver logado com e-mail/senha (ou seja, editores) — a proteção acontece no banco de dados, não só na tela:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /esteira-edicao/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.firebase.sign_in_provider != 'anonymous';
    }
  }
}
```

8. Publique as regras (**Publicar**).
9. Faça commit e push da alteração no `index.html` (com suas chaves reais) para o GitHub — veja a seção abaixo.

> A `apiKey` do Firebase para apps Web não é um segredo (ela só identifica o projeto); quem protege os dados de verdade são as regras do Firestore acima, por isso é normal ela ficar visível no código publicado.

## Podcasts recorrentes

O painel "Podcasts" (na coluna lateral) guarda a lista de podcasts que você edita regularmente. Ao criar um novo job, escolha **Podcast recorrente** para selecionar um da lista (em vez de digitar o nome toda vez) e opcionalmente completar com o número do episódio — ou **Esporádica** para um job avulso, como antes. Cadastrar/remover podcasts também é uma ação de editor.

## Editores x visualizadores (clientes)

Qualquer pessoa que abrir o link consegue **ver** o quadro (inclusive clientes, sem precisar de conta ou senha) — mas só consegue **editar** quem tiver feito login como editor. Os botões de criar, mover, editar e excluir job ficam escondidos pra quem não é editor, e mesmo que alguém tente forçar pelo console do navegador, as regras do Firestore acima bloqueiam a escrita de verdade.

Para criar uma conta de editor (você mesmo ou alguém da equipe):

1. No console do Firebase, vá em **Authentication → Users → Add user**.
2. Preencha um e-mail e uma senha para essa pessoa e clique em **Add user**.
3. Repita para cada pessoa da equipe que precisa editar.
4. No site, clique em **Entrar** (canto superior direito) e faça login com esse e-mail e senha.

Não existe cadastro público — só quem você criar manualmente no Firebase consegue editar. Para enviar o link só de visualização a um cliente, basta mandar a URL normal do site; ele nunca vê o botão "Entrar" fazer diferença, só não vê os controles de edição.

## Anexos

Clicando em qualquer card abre a visão detalhada, onde dá pra anexar links (Google Drive, WeTransfer, Frame.io etc.), editar o nome e marcar os formatos concluídos. Funciona sem nenhuma configuração extra no Firebase.

## Cortes de edição

Dentro da visão detalhada de cada card tem uma seção "Cortes de edição": uma tabela com início, fim, duração, orador, descrição/tópico e tag por corte, com um checkbox por linha pra marcar como concluído. Cada job tem sua própria tabela, salva no Firestore junto com o job. Dá pra editar qualquer célula na mão, adicionar linhas com **"+ Linha manual"** ou remover uma linha pelo ✕ — tudo isso é ação de editor (viewers só veem a tabela, sem os controles).

Pra organizar um texto bagunçado (transcrição, anotações) numa lista de cortes, o fluxo é: cole o texto numa conversa com o Claude e peça pra organizar no formato `início | fim | duração | orador | descrição | tag`, uma linha por corte; depois cole o resultado na caixa de texto da seção "Cortes de edição" e clique em **"Importar linhas coladas"** — o site quebra cada linha pelas barras verticais e cria uma linha na tabela pra cada uma, sem nenhuma chamada de API.

> Por que não é automático dentro do site: chegamos a integrar a API do Google Gemini direto no navegador, mas chaves novas do Gemini exigem vínculo com uma conta de serviço, e esse tipo de chave não aceita restrição por domínio — então, assim que a chave aparece no código público do repositório, o Google a revoga automaticamente (proteção do próprio Google contra chaves vazadas). Não tem como contornar isso mantendo o site 100% estático; a alternativa seria um backend próprio (ex: Firebase Cloud Functions) guardando a chave em segredo, o que exigiria ativar o plano pago do Firebase e mais uma etapa de configuração.

## Instalar como app no celular (PWA)

O site é um PWA (Progressive Web App): dá pra instalar na tela de início do celular e abrir como um app normal, em tela cheia, sem a barra de endereço do navegador — resolve a navegação ruim de ficar usando pelo navegador comum.

- **Android (Chrome)**: aparece um botão **"📲 Instalar"** no topo da versão mobile do site. Basta tocar nele e confirmar.
- **iPhone/iPad (Safari)**: o iOS não permite instalar automaticamente — toque no ícone de **Compartilhar** (quadrado com seta pra cima) na barra do Safari e depois em **"Adicionar à Tela de Início"**. O botão "Instalar" no site mostra esse mesmo passo a passo quando tocado num iPhone.

Depois de instalado, o ícone usa a logo da WEN e o app abre direto no quadro, sem precisar digitar a URL toda vez.

## Layout mobile e toque-e-segure

No celular, o quadro aparece como uma lista vertical só (todas as colunas empilhadas, sem precisar arrastar pros lados), com cada job numa linha enxuta: um pontinho colorido indicando o status/prazo, o nome e uma linha de prazo embaixo. Os botões de mover/duplicar/remover/refação ficam escondidos dessa lista pra deixar ela limpa — pra usar essas ações no mobile, é só tocar no card pra abrir os detalhes (lá tem tudo) ou **tocar e segurar** o card por meio segundo pra abrir um menu rápido "Mover para..." com todas as colunas.

## Notificação de prazo

Editores logados veem um aviso no topo do quadro sempre que algum job estiver atrasado ou vencendo hoje (considerando o prazo de 4 dias úteis, seja da decupagem original ou de uma refação em andamento). Clicando num item do aviso, abre direto o job.

Tem também um sino **🔔** no topo (ao lado do botão de entrar) pra ativar notificações do próprio navegador/celular — assim que alguém com permissão de editor abrir o site num dia com algo atrasado ou vencendo, recebe uma notificação do sistema (uma vez por dia, não fica repetindo). Isso só funciona enquanto alguém abre o site em algum momento do dia — não é uma notificação push de verdade chegando com o app fechado (isso exigiria um servidor rodando separado, com custo de infraestrutura).

## Publicar / acessar de qualquer lugar (GitHub Pages)

Depois que o repositório for publicado no GitHub com Pages habilitado, o site fica disponível em:

```
https://<seu-usuario>.github.io/esteira-edicao/
```

Qualquer atualização enviada (`git push`) para a branch `main` atualiza o site automaticamente em alguns minutos.

## Rodar localmente

Basta abrir o `index.html` no navegador. Não precisa de servidor nem de instalação — é só HTML/CSS/JS puro.
