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

## Cortes de edição (com organização por IA)

Dentro da visão detalhada de cada card tem uma seção "Cortes de edição": uma área pra colar texto bruto (transcrição, anotações, lista de trechos) e organizar automaticamente numa tabela — com colunas de início, fim, duração, orador, descrição/tópico e tag — e um checkbox por linha pra marcar o corte como concluído. Cada job tem sua própria tabela, salva no Firestore junto com o job. Dá pra editar qualquer célula na mão, adicionar linhas manualmente ou remover linhas — tudo isso é ação de editor (viewers só veem a tabela, sem os controles).

A organização automática usa a **API do Google Gemini** (tem uso gratuito, sem cartão de crédito, com uma cota diária generosa):

1. Acesse [console.cloud.google.com](https://console.cloud.google.com) → **APIs e serviços → Credenciais → Criar credenciais → Chave de API**.
2. No diálogo de criação, em **"Selecionar restrições da API"**, escolha **Generative Language API** (a API do Gemini). Isso é obrigatório para usar o Gemini com uma chave nova — o próprio Google exige que a chave seja vinculada a uma conta de serviço para essa API. Marque o checkbox **"Autenticar chamadas de API por uma conta de serviço"** e selecione (ou crie) uma conta de serviço quando pedido; nenhuma permissão especial precisa ser dada a ela.
3. **Sobre restringir a chave por site**: normalmente se recomendaria travar a chave para só funcionar a partir do seu domínio (restrição por HTTP referrer), mas **esse tipo de chave — vinculada a conta de serviço — não suporta essa restrição**. A única defesa prática contra abuso, já que o código fica público no navegador de qualquer pessoa, é limitar o estrago possível: depois de criar a chave, vá em **APIs e serviços → Painel → Generative Language API → Cotas e limites do sistema** e defina um limite diário baixo de requisições, e configure um alerta de orçamento em **Faturamento → Orçamentos e alertas**.
4. Abra o [index.html](index.html), procure o bloco `CONFIGURAÇÃO DA IA` (perto do fim do arquivo) e cole a chave no lugar de `GEMINI_API_KEY`.
5. Faça commit e push. **Atenção**: o GitHub bloqueia automaticamente (`push protection`) qualquer tentativa de subir esse tipo de chave por padrão, mesmo sendo uma chave legítima e intencional para este projeto — quando isso acontecer, o próprio erro do `git push` traz um link "para permitir o segredo"; abra esse link logado na sua conta do GitHub e confirme, depois tente o push de novo.

Depois disso, é só colar o texto na caixa e clicar em **Organizar com IA** — as linhas geradas são adicionadas à tabela do job (sem apagar linhas já existentes). Se a chave não estiver configurada, o botão mostra um aviso explicando o que falta.

## Publicar / acessar de qualquer lugar (GitHub Pages)

Depois que o repositório for publicado no GitHub com Pages habilitado, o site fica disponível em:

```
https://<seu-usuario>.github.io/esteira-edicao/
```

Qualquer atualização enviada (`git push`) para a branch `main` atualiza o site automaticamente em alguns minutos.

## Rodar localmente

Basta abrir o `index.html` no navegador. Não precisa de servidor nem de instalação — é só HTML/CSS/JS puro.
