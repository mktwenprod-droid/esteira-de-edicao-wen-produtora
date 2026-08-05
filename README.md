# Esteira de Edição

Quadro kanban para acompanhar jobs de edição de vídeo (decupagem → recebido → edição → revisão → entregue), com prazo automático de 4 dias úteis a partir do recebimento da decupagem.

É um site estático (HTML/CSS/JS puro, sem build), sincronizado em tempo real entre dispositivos via **Firebase Firestore**, publicado no **GitHub Pages**.

## Configurar o Firebase (obrigatório para sincronizar)

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto novo (pode ser gratuito, plano Spark).
2. No menu lateral, vá em **Firestore Database** → **Criar banco de dados** → escolha uma localização → modo **produção**.
3. Vá em **Authentication** → aba **Sign-in method** → ative o provedor **Anônimo**.
4. Vá em **Configurações do projeto** (ícone de engrenagem) → **Seus apps** → clique no ícone `</>` (Web) para registrar um app.
5. Copie o objeto `firebaseConfig` que aparece.
6. Abra o [index.html](index.html) deste projeto, procure o bloco `CONFIGURAÇÃO DO FIREBASE` (perto do fim do arquivo) e substitua os valores de exemplo pelos que você copiou.
7. Em **Firestore Database → Regras**, cole as regras abaixo (exige login, mesmo anônimo, para ler/escrever — evita que qualquer pessoa na internet acesse seus dados sem passar pelo app):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /esteira-edicao/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

8. Publique as regras (**Publicar**).
9. Faça commit e push da alteração no `index.html` (com suas chaves reais) para o GitHub — veja a seção abaixo.

> A `apiKey` do Firebase para apps Web não é um segredo (ela só identifica o projeto); quem protege os dados de verdade são as regras do Firestore acima, por isso é normal ela ficar visível no código publicado.

## Anexos

Clicando em qualquer card abre a visão detalhada, onde dá pra anexar links (Google Drive, WeTransfer, Frame.io etc.), editar o nome e marcar os formatos concluídos. Funciona sem nenhuma configuração extra no Firebase.

## Configurar a agenda do Google Calendar (opcional)

O painel lateral "Agenda" mostra os próximos eventos do Google Calendar de quem estiver logado. É gratuito — a API do Google Calendar não tem plano pago, só uma cota diária bem generosa, sem precisar de cartão de crédito.

1. Acesse [console.cloud.google.com](https://console.cloud.google.com) e crie um projeto novo (pode reaproveitar um existente).
2. Vá em **APIs e serviços → Biblioteca**, procure **Google Calendar API** e clique em **Ativar**.
3. Vá em **APIs e serviços → Tela de consentimento OAuth**. Escolha **Externo**, preencha o nome do app e seu e-mail, e deixe em modo **Teste** — nesse modo não precisa de verificação do Google, só funciona para os e-mails que você adicionar como **usuários de teste** (adicione o seu e o de quem mais for usar).
4. Vá em **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**. Tipo de aplicativo: **Aplicativo da Web**. Em **Origens JavaScript autorizadas**, adicione a URL do seu site publicado (ex: `https://seu-usuario.github.io`) — sem caminho no final.
5. Copie o **Client ID** gerado (termina em `.apps.googleusercontent.com`).
6. Abra o [index.html](index.html), procure o bloco `CONFIGURAÇÃO DO GOOGLE CALENDAR` (perto do fim do arquivo) e cole o Client ID no lugar de `GOOGLE_CLIENT_ID`.
7. Faça commit e push. No painel lateral do site, clique em **Conectar com Google** e autorize o acesso (somente leitura) à sua agenda.

## Publicar / acessar de qualquer lugar (GitHub Pages)

Depois que o repositório for publicado no GitHub com Pages habilitado, o site fica disponível em:

```
https://<seu-usuario>.github.io/esteira-edicao/
```

Qualquer atualização enviada (`git push`) para a branch `main` atualiza o site automaticamente em alguns minutos.

## Rodar localmente

Basta abrir o `index.html` no navegador. Não precisa de servidor nem de instalação — é só HTML/CSS/JS puro.
