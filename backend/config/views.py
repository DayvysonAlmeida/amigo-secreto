from django.conf import settings
from django.db import connection
from django.http import Http404, HttpResponse, JsonResponse
from django.utils.html import escape
from django.views.static import serve

OG_IMAGE_PATH = "/og-image.jpg"


def media(request, path):
    """Fotos de perfil. O upload só aceita imagens validadas (sorteio/views.py), então servir
    pelo Django é seguro; com muitos acessos, vale trocar por um storage externo (S3, R2...)."""
    return serve(request, path, document_root=settings.MEDIA_ROOT)


def health(request):
    """Usado pela hospedagem para saber se o serviço está no ar (inclui o banco)."""
    try:
        connection.ensure_connection()
    except Exception:
        return JsonResponse({"status": "erro", "database": False}, status=503)
    return JsonResponse({"status": "ok"})


def _preview_tags(request):
    # A prévia do link no WhatsApp exige o endereço completo da imagem,
    # que só é conhecido aqui (o build do frontend não sabe o domínio).
    image = escape(request.build_absolute_uri(OG_IMAGE_PATH))
    return (
        f'<meta property="og:image" content="{image}" />'
        '<meta property="og:image:type" content="image/jpeg" />'
        '<meta property="og:image:width" content="1200" />'
        '<meta property="og:image:height" content="630" />'
        '<meta property="og:image:alt" content="Amigo Secreto: sorteio online e um link secreto para cada pessoa" />'
    )


def spa_index(request):
    """Entrega o app React para as rotas do frontend (/dashboard, /revelar/<token>, ...)."""
    index = settings.FRONTEND_DIST_DIR / "index.html"
    try:
        html = index.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise Http404("Frontend não compilado: rode `npm run build` na pasta frontend.")

    if 'property="og:image"' not in html:
        html = html.replace("</head>", _preview_tags(request) + "</head>", 1)

    response = HttpResponse(html)
    # O index.html aponta para os arquivos da versão atual: nunca guardar em cache.
    response["Cache-Control"] = "no-cache"
    return response
