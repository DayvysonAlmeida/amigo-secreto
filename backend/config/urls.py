from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import health, media, spa_index

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('sorteio.urls')),
    re_path(r'^media/(?P<path>.+)$', media, name='media'),
    # Qualquer outra rota é do app React (o React Router decide o que mostrar).
    re_path(r'^(?!api/|admin/|static/|media/).*$', spa_index, name='spa'),
]
