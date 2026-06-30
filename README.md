# 🎁 Amigo Secreto (Secret Santa App)

Um aplicativo web moderno e completo para organização de sorteios de Amigo Secreto. Construído com foco em usabilidade e com uma interface minimalista (inspirada em designs SaaS de alto padrão como Linear e Stripe).

## ✨ Funcionalidades

- **🔐 Autenticação Segura:** Login e Cadastro protegidos por JWT (JSON Web Tokens).
- **👥 Gestão de Grupos:** Crie múltiplos grupos de amigo secreto, defina orçamento e adicione descrições.
- **🧑‍🤝‍🧑 Participantes & Lista de Desejos:** Adicione participantes e permita que eles declarem o que gostariam de ganhar.
- **🎲 Sorteio Inteligente:** O algoritmo garante que o sorteio ocorra sem erros (ninguém tira a si mesmo).
- **🔗 Compartilhamento Fácil:** O link de revelação pode ser enviado com 1 clique diretamente pelo WhatsApp ou copiado para a área de transferência. O resultado é privado e o participante acessa sem precisar criar conta.
- **🖼️ Perfil do Usuário:** Personalização de foto de perfil (Avatar), telefone e gerenciamento de segurança (alteração de senhas).
- **🌓 Dark Mode:** Suporte nativo e fluido para Tema Escuro.

## 💻 Tecnologias Utilizadas

### Frontend
- **React (Vite):** Framework principal e empacotador super rápido.
- **CSS Modules:** Estilização componentizada (Vanilla CSS com tokens).
- **Axios:** Cliente HTTP para comunicação com a API.
- **Lucide React:** Biblioteca de ícones modernos e leves.
- **React Router Dom:** Gerenciamento das rotas e rotas privadas.

### Backend
- **Python & Django:** Framework base do servidor.
- **Django REST Framework (DRF):** Construção da API RESTful.
- **SimpleJWT:** Gestão dos tokens de acesso e refresh.
- **Pillow:** Processamento e armazenamento de imagens de Perfil.
- **SQLite:** Banco de dados relacional padrão (fácil de migrar para PostgreSQL).

## 🚀 Como Executar o Projeto Localmente

Siga as instruções abaixo para rodar o projeto na sua máquina.

### Pré-requisitos
- Python 3.10+
- Node.js 18+

### 1. Configurando o Backend (Django)

```bash
# Entre na pasta do backend
cd backend

# Crie e ative o ambiente virtual (Windows)
python -m venv venv
.\venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

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
O frontend estará acessível em `http://localhost:5173`.

## 📸 Telas do Sistema

> *(Você pode adicionar imagens das telas aqui posteriormente)*
- **Dashboard:** Visão geral com estatísticas.
- **Sorteio:** Animação minimalista na geração do amigo secreto.
- **Revelação:** Página pública elegante para o participante ver quem tirou.

---
Feito com 💡 e ☕ para simplificar as festas de fim de ano!
