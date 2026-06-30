# Amigo Secreto

Aplicação full-stack para organizar sorteios de amigo secreto.

- **Backend:** Django + Django REST Framework
- **Frontend:** React + Vite

## Funcionalidades

- Criar grupos com nome, descrição e valor sugerido do presente
- Adicionar participantes com lista de desejos opcional
- Sortear automaticamente (ninguém tira a si mesmo)
- Link individual e secreto para cada participante descobrir seu amigo
- Painel do organizador para gerenciar o grupo

## Estrutura

```
secreto/
├── backend/     # API Django
└── frontend/    # App React
```

## Como rodar

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

A API ficará em `http://127.0.0.1:8000/api/`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Fluxo de uso

1. Crie um grupo na página inicial
2. Guarde o **link do organizador**
3. Adicione todos os participantes
4. Clique em **Realizar sorteio**
5. Copie e envie o link individual de cada participante (WhatsApp, e-mail, etc.)
6. Cada pessoa abre seu link e descobre quem sorteou — sem ver os demais

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/groups/` | Criar grupo |
| GET | `/api/groups/{admin_token}/` | Detalhes do grupo |
| POST | `/api/groups/{admin_token}/participants/` | Adicionar participante |
| DELETE | `/api/groups/{admin_token}/participants/{id}/` | Remover participante |
| POST | `/api/groups/{admin_token}/draw/` | Realizar sorteio |
| GET | `/api/reveal/{participant_token}/` | Revelar amigo secreto |

## Produção

Para deploy, configure `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` e uma `SECRET_KEY` segura no Django. Faça o build do frontend com `npm run build` e sirva os arquivos estáticos ou use um reverse proxy apontando `/api` para o Django.
