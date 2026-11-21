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

O projeto sobe como **um único serviço** a partir do `Dockerfile`: o Django entrega a API, o admin e o app React no mesmo endereço. Funciona em qualquer hospedagem que aceite Docker (Render, Railway, Fly.io, Koyeb...).

### Banco de dados

Use um PostgreSQL e informe o endereço dele em `DATABASE_URL`. Opções gratuitas: **Neon** ou **Supabase**. O Postgres gratuito do Render também funciona, mas expira 30 dias depois de criado.

Sem `DATABASE_URL` o servidor de produção não sobe, de propósito: um SQLite dentro do container perderia todos os grupos a cada reinício.

### Passo a passo no Render

1. Crie o banco (ex.: no Neon) e copie o endereço de conexão (`postgresql://...`).
2. No Render, clique em **New > Blueprint** e escolha este repositório (ele usa o `render.yaml`).
3. Quando o Render pedir, cole o endereço do banco em `DATABASE_URL`. A `DJANGO_SECRET_KEY` é gerada sozinha.
4. Terminado o deploy, o site fica em `https://<nome-do-serviço>.onrender.com`.
5. Para usar um domínio próprio, adicione-o no Render e em `DJANGO_ALLOWED_HOSTS`.
6. Opcional: para entrar no admin do Django (`/admin/`), rode `python manage.py createsuperuser` com a `DATABASE_URL` de produção (pelo Shell do Render nos planos pagos, ou do seu computador).

### Variáveis de ambiente

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Sim | Chave secreta. Gere uma nova; nunca reutilize a do histórico do repositório. |
| `DATABASE_URL` | Sim | Endereço do PostgreSQL. |
| `DJANGO_ALLOWED_HOSTS` | Fora do Render | Domínios do site, separados por vírgula. No Render o endereço `.onrender.com` entra sozinho. |
| `DJANGO_MEDIA_ROOT` | Não | Pasta das fotos de perfil, num disco persistente. |
| `CORS_ALLOWED_ORIGINS` | Não | Só se o frontend ficar em outro domínio (veja `frontend/.env.example`). |
| `DJANGO_DEBUG` | Não | Modo de desenvolvimento. Nunca use `True` em produção. |

O modelo completo, com explicações, está em `backend/.env.example`.

### Bom saber

- **O plano gratuito do Render "dorme"** depois de 15 minutos sem acesso, e o primeiro acesso seguinte leva cerca de um minuto. Para quem abre o link pelo WhatsApp não esperar, o plano pago mais barato resolve.
- **As fotos de perfil ficam no disco do servidor**, que é apagado a cada deploy nos planos gratuitos. Sem disco persistente (`DJANGO_MEDIA_ROOT`), a foto some e o app volta a mostrar as iniciais.

## 📸 Telas do Sistema

> <img width="1917" height="943" alt="Captura de tela 2026-06-30 181418" src="https://github.com/user-attachments/assets/07a39c4b-c53c-449b-8c23-5d903240b3b1" />

<img width="1907" height="944" alt="Captura de tela 2026-06-30 181504" src="https://github.com/user-attachments/assets/17b99336-9df9-41f9-a467-df25102f5d82" />
<img width="1909" height="947" alt="Captura de tela 2026-06-30 181451" src="https://github.com/user-attachments/assets/85b14aa2-fcad-49c3-8b43-36a9c9e84d8a" />


- **Dashboard:** Visão geral com estatísticas.
- **Sorteio:** Animação minimalista na geração do amigo secreto.
- **Revelação:** Página pública elegante para o participante ver quem tirou.

---
Feito com 💡 e ☕ para simplificar as festas de fim de ano!
