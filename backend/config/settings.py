"""
Configurações do Django.

Tudo que muda entre o computador local e a hospedagem vem de variáveis de ambiente
(veja backend/.env.example). Sem nenhuma variável, o padrão é o modo de produção:
quem desenvolve localmente liga o modo de desenvolvimento com DJANGO_DEBUG=True
no arquivo backend/.env.
"""

import os
import re
from datetime import timedelta
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# backend/.env é opcional e fica fora do git. Variáveis já definidas no ambiente têm prioridade.
load_dotenv(BASE_DIR / ".env")


def env_bool(name, default=False):
    return os.environ.get(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_list(name, default=""):
    return [item.strip() for item in os.environ.get(name, default).split(",") if item.strip()]


DEBUG = env_bool("DJANGO_DEBUG", False)

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured(
            "Defina a variável DJANGO_SECRET_KEY (ou DJANGO_DEBUG=True para desenvolvimento local)."
        )
    # Só para desenvolvimento local: esta chave está no histórico do git e não pode ir para produção.
    SECRET_KEY = "django-insecure-+x=12%i5hq3y0-d6w=u@1^wlg^3lxefh&(w^f(7+jdj6sntose"

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")
CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS")

# O Render informa o endereço público do serviço nesta variável.
RENDER_EXTERNAL_HOSTNAME = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)
    CSRF_TRUSTED_ORIGINS.append(f"https://{RENDER_EXTERNAL_HOSTNAME}")


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'sorteio',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Banco de dados: DATABASE_URL na hospedagem (ex.: Postgres); sem ela, o SQLite local.

if os.environ.get("DATABASE_URL"):
    DATABASES = {
        "default": dj_database_url.parse(
            os.environ["DATABASE_URL"], conn_max_age=600, conn_health_checks=True
        )
    }
else:
    # Na hospedagem o disco do container é apagado a cada deploy/reinício: um SQLite lá perderia
    # todos os grupos. Por isso a produção exige DATABASE_URL (DJANGO_ALLOW_SQLITE=True libera,
    # só para testes locais ou para quem tem disco persistente).
    if not DEBUG and not env_bool("DJANGO_ALLOW_SQLITE"):
        raise ImproperlyConfigured(
            "Defina DATABASE_URL com o endereço do banco (ex.: Postgres). "
            "Sem ela os dados seriam perdidos a cada reinício do servidor."
        )
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": Path(os.environ.get("DJANGO_SQLITE_PATH", BASE_DIR / "db.sqlite3")),
        }
    }


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'pt-br'

TIME_ZONE = 'America/Sao_Paulo'

USE_I18N = True

USE_TZ = True


# Arquivos estáticos (admin do Django) e o app React já compilado, servidos pelo WhiteNoise.

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"
        if DEBUG
        else "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Saída do `npm run build`. Quando existe, o Django entrega o frontend no mesmo endereço da API.
FRONTEND_DIST_DIR = Path(os.environ.get("FRONTEND_DIST_DIR", BASE_DIR.parent / "frontend" / "dist"))
if FRONTEND_DIST_DIR.is_dir():
    WHITENOISE_ROOT = FRONTEND_DIST_DIR

_VITE_ASSET = re.compile(r"^/assets/.+-[0-9a-zA-Z_-]{8}\.\w+$")  # assets/index-Bv5A5eNz.js
_DJANGO_HASHED = re.compile(r"^.+\.[0-9a-f]{12}\.\w+$")  # static/admin/css/base.5af66c1b1797.css


def WHITENOISE_IMMUTABLE_FILE_TEST(path, url):
    # Arquivos com hash no nome nunca mudam de conteúdo: podem ficar em cache por muito tempo.
    return bool(_VITE_ASSET.match(url) or _DJANGO_HASHED.match(url))


# Fotos de perfil. Na hospedagem, DJANGO_MEDIA_ROOT deve apontar para um disco persistente.
MEDIA_URL = "/media/"
MEDIA_ROOT = Path(os.environ.get("DJANGO_MEDIA_ROOT", BASE_DIR / "media"))

# Só é necessário quando o frontend fica em outro domínio (ex.: Vercel + API no Render).
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)


# Segurança em produção (atrás do HTTPS da hospedagem).
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", True)
    SECURE_REDIRECT_EXEMPT = [r"^api/health/$"]
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(os.environ.get("DJANGO_SECURE_HSTS_SECONDS", 60 * 60 * 24 * 30))


# Erros vão para a saída padrão, onde a hospedagem mostra os logs.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "WARNING"},
}


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    # Login pelo e-mail sem diferenciar maiúsculas (sorteio/serializers.py).
    'TOKEN_OBTAIN_SERIALIZER': 'sorteio.serializers.EmailTokenObtainPairSerializer',
}
