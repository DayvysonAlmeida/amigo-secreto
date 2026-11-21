# 🎁 Amigo Secreto (Secret Santa App)

Um aplicativo web moderno e completo para organização de sorteios de Amigo Secreto. Construído com foco em usabilidade e com uma interface minimalista (inspirada em designs SaaS de alto padrão como Linear e Stripe).

## ✨ Funcionalidades

- **🔐 Autenticação Segura:** Login e Cadastro protegidos por JWT (JSON Web Tokens).
- **👥 Gestão de Grupos:** Crie múltiplos grupos de amigo secreto, defina orçamento e adicione descrições.
- **🧑‍🤝‍🧑 Participantes & Lista de Desejos:** Adicione participantes e permita que eles declarem o que gostariam de ganhar.
- **🎲 Sorteio Inteligente:** O algoritmo garante que o sorteio ocorra sem erros (ninguém tira a si mesmo).
- **🔗 Compartilhamento Fácil:** O link de revelação pode ser enviado com 1 clique diretamente pelo WhatsApp ou copiado para a área de transferência. O resultado é privado e o participante acessa sem precisar criar conta.
- **🖼️ Perfil do Usuário:** Personalização de foto de perfil (Avatar), telefone e gerenciamento de segurança (alteração de senhas).
- **🌓 Dark Mode:** Segue o tema do aparelho, com opção de trocar no Perfil.
- **📱 Instalável:** Pode ser adicionado à tela inicial do celular e abre como um app.

## 💻 Tecnologias Utilizadas

### Frontend
- **React (Vite):** Framework principal e empacotador super rápido.
- **CSS Modules:** Estilização componentizada (Vanilla CSS com tokens).
- **fetch nativo:** Comunicação com a API sem biblioteca extra (`src/api.js`).
- **Inter (Fontsource):** Fonte servida pelo próprio app, sem depender do Google Fonts.
- **Lucide React:** Biblioteca de ícones modernos e leves.
- **React Router Dom:** Gerenciamento das rotas e rotas privadas.

### Backend
- **Python & Django:** Framework base do servidor.
- **Django REST Framework (DRF):** Construção da API RESTful.
- **SimpleJWT:** Gestão dos tokens de acesso e refresh.
- **Pillow:** Processamento e armazenamento de imagens de Perfil.
- **SQLite / PostgreSQL:** SQLite no desenvolvimento e PostgreSQL em produção.
- **WhiteNoise + Gunicorn:** Servem o site e a API em produção.

## 🚀 Como Executar o Projeto Localmente

Siga as instruções abaixo para rodar o projeto na sua máquina.

### Pré-requisitos
- Python 3.12+
- Node.js 20.19+

### 1. Configurando o Backend (Django)

```bash
# Entre na pasta do backend
cd backend

# Crie e ative o ambiente virtual (Windows)
python -m venv venv
.\venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Crie o arquivo de configuração local (liga o modo de desenvolvimento)
copy .env.example .env

# Execute as migrações do banco de dados
python manage.py migrate

# Inicie o servidor
python manage.py runserver
```
O backend estará rodando em `http://127.0.0.1:8000`.

### 2. Configurando o Frontend (React)

Em um terminal separado:

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
O frontend estará acessível em `http://localhost:5173`. As chamadas para `/api` são repassadas ao Django na porta 8000.

### Testes

```bash
cd backend
python manage.py test sorteio
```

## ☁️ Hospedagem

O projeto sobe como **um único serviço** a partir do `Dockerfile`: o Django entrega a API, o admin e o app React no mesmo endereço. Funciona em qualquer hospedagem que aceite Docker.

A versão no ar usa o **Google Cloud Run** (site) e o **Neon** (banco PostgreSQL), dentro das cotas gratuitas dos dois.

### Banco de dados (Neon)

1. Crie um projeto no [Neon](https://neon.tech) na região **AWS US East 1 (N. Virginia)**, a mais próxima do Cloud Run em `us-east4`. Cada página consulta o banco várias vezes, então os dois precisam ficar perto.
2. Em **Connect**, desligue *Connection pooling* e copie o endereço (`postgresql://...`). Ele vai na variável `DATABASE_URL`.

Sem `DATABASE_URL` o servidor de produção não sobe, de propósito: um SQLite dentro do container perderia todos os grupos a cada reinício.

### Primeiro deploy no Cloud Run

Precisa do [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) logado e de um projeto do Google Cloud com faturamento vinculado. Os comandos são do PowerShell:

```powershell
$PROJETO = "id-do-projeto"
$REGIAO  = "us-east4"
gcloud config set project $PROJETO
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com storage.googleapis.com compute.googleapis.com

# Bucket das fotos de perfil. Fica privado: quem entrega as fotos é o Django.
$BUCKET = "$PROJETO-fotos"
$NUMERO = gcloud projects describe $PROJETO --format="value(projectNumber)"
$SITE   = "serviceAccount:$NUMERO-compute@developer.gserviceaccount.com"
gcloud storage buckets create "gs://$BUCKET" --location $REGIAO --uniform-bucket-level-access --public-access-prevention
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" --member $SITE --role roles/storage.objectAdmin
gcloud projects add-iam-policy-binding $PROJETO --member $SITE --role roles/run.builder
```

Crie o arquivo de variáveis **fora do repositório**, por exemplo em `..\cloudrun-env.yaml`. Ele tem a senha do banco e nunca deve ir para o git:

```yaml
# Gere a chave com: python -c "import secrets; print(secrets.token_urlsafe(50))"
DJANGO_SECRET_KEY: "..."
DATABASE_URL: "postgresql://..."
DJANGO_ALLOWED_HOSTS: ".run.app"
DJANGO_MEDIA_ROOT: "/mnt/media"
```

E faça o deploy:

```powershell
gcloud run deploy amigo-secreto `
  --source . `
  --region $REGIAO `
  --no-invoker-iam-check `
  --env-vars-file ..\cloudrun-env.yaml `
  --execution-environment gen2 `
  --add-volume "name=fotos,type=cloud-storage,bucket=$BUCKET" `
  --add-volume-mount "volume=fotos,mount-path=/mnt/media" `
  --min-instances 0 `
  --max-instances 2
```

- `--no-invoker-iam-check` deixa o site aberto ao público, mesmo em organizações do Google Cloud que bloqueiam o acesso público pelo jeito tradicional (`allUsers`).
- Ao subir, o container aplica as migrações sozinho.
- Para entrar no admin (`/admin/`), rode `python manage.py createsuperuser` no seu computador com a `DATABASE_URL` de produção.

### Deploy automático (push no `main`)

O `cloudbuild.yaml` monta a imagem e publica uma versão nova no Cloud Run. Só a imagem muda: as variáveis, o bucket e os limites continuam os do serviço. Um gatilho do Cloud Build roda esse arquivo a cada push no `main`.

1. Crie a conta de serviço do deploy. Ela é separada da conta do site, para o site não ter permissão de se republicar:
   ```powershell
   $DEPLOY = "cloudbuild-deploy@$PROJETO.iam.gserviceaccount.com"
   gcloud iam service-accounts create cloudbuild-deploy
   gcloud projects add-iam-policy-binding $PROJETO --member "serviceAccount:$DEPLOY" --role roles/run.builder
   gcloud projects add-iam-policy-binding $PROJETO --member "serviceAccount:$DEPLOY" --role roles/run.developer
   gcloud iam service-accounts add-iam-policy-binding "$NUMERO-compute@developer.gserviceaccount.com" --member "serviceAccount:$DEPLOY" --role roles/iam.serviceAccountUser
   ```
2. No console, em **Cloud Build > Gatilhos > Conectar repositório**, conecte o GitHub e escolha este repositório.
3. Crie o gatilho: evento **push em uma ramificação** (`^main$`), configuração **arquivo do Cloud Build** (`cloudbuild.yaml`) e a conta de serviço `cloudbuild-deploy`.

Depois disso, publicar é só fazer `git push` no `main`. O andamento aparece em **Cloud Build > Histórico**. Também dá para publicar a partir da pasta local com `gcloud run deploy amigo-secreto --source . --region us-east4`.

### Custos

Para o uso de um amigo secreto, tudo fica dentro das cotas gratuitas. As proteções configuradas:

- **Cloud Run:** desliga quando ninguém usa (`--min-instances 0`) e não passa de 2 instâncias (`--max-instances 2`).
- **Artifact Registry:** uma política de limpeza guarda só as 3 imagens mais recentes.
- **Bucket `run-sources-...`:** as cópias do código enviadas pelo `--source` são apagadas depois de 7 dias.
- **Alerta de orçamento** (Faturamento > Orçamentos e alertas): avisa por e-mail se o gasto do projeto passar de R$ 10 no mês.

### Variáveis de ambiente

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Sim | Chave secreta. Gere uma nova; nunca reutilize a do histórico do repositório. |
| `DATABASE_URL` | Sim | Endereço do PostgreSQL. |
| `DJANGO_ALLOWED_HOSTS` | Sim (menos no Render) | Domínios do site, separados por vírgula. No Cloud Run, `.run.app`; com domínio próprio, acrescente-o. No Render o endereço `.onrender.com` entra sozinho. |
| `DJANGO_MEDIA_ROOT` | Não | Pasta das fotos de perfil num disco persistente. No Cloud Run, a pasta onde o bucket é montado. |
| `CORS_ALLOWED_ORIGINS` | Não | Só se o frontend ficar em outro domínio (veja `frontend/.env.example`). |
| `DJANGO_DEBUG` | Não | Modo de desenvolvimento. Nunca use `True` em produção. |

O modelo completo, com explicações, está em `backend/.env.example`.

### Outras hospedagens

O `render.yaml` sobe o mesmo `Dockerfile` no Render (**New > Blueprint**). Lá a `DJANGO_SECRET_KEY` é gerada sozinha e o endereço `.onrender.com` entra sozinho nos domínios permitidos. No plano gratuito, o serviço "dorme" depois de 15 minutos sem acesso (o próximo acesso leva cerca de um minuto) e as fotos de perfil somem a cada deploy, porque não há disco persistente.

## 📸 Telas do Sistema

> <img width="1917" height="943" alt="Captura de tela 2026-06-30 181418" src="https://github.com/user-attachments/assets/07a39c4b-c53c-449b-8c23-5d903240b3b1" />

<img width="1907" height="944" alt="Captura de tela 2026-06-30 181504" src="https://github.com/user-attachments/assets/17b99336-9df9-41f9-a467-df25102f5d82" />
<img width="1909" height="947" alt="Captura de tela 2026-06-30 181451" src="https://github.com/user-attachments/assets/85b14aa2-fcad-49c3-8b43-36a9c9e84d8a" />


- **Dashboard:** Visão geral com estatísticas.
- **Sorteio:** Animação minimalista na geração do amigo secreto.
- **Revelação:** Página pública elegante para o participante ver quem tirou.

---
Feito com 💡 e ☕ para simplificar as festas de fim de ano!
