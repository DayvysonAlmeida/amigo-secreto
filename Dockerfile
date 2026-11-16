# Imagem única: o Django entrega a API, o admin e o app React já compilado, no mesmo endereço.
# Funciona em qualquer hospedagem que aceite Docker (Render, Railway, Fly.io, Koyeb...).

# 1) Compila o frontend
FROM node:22-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2) Backend com o frontend compilado
FROM python:3.14-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend/ ./
COPY --from=frontend /app/frontend/dist /app/frontend/dist
# Valores só para o collectstatic rodar no build; os de verdade vêm das variáveis da hospedagem.
RUN DJANGO_SECRET_KEY=build-only DJANGO_ALLOW_SQLITE=True python manage.py collectstatic --noinput

EXPOSE 8000
# Aplica as migrações e sobe o servidor. PORT é definida pela hospedagem.
CMD ["sh", "-c", "python manage.py migrate --noinput && exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-2} --access-logfile -"]
