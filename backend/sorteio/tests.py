from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Group, Participant


class GroupFlowTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("org@teste.com", "org@teste.com", "SenhaForte#2026")
        self.client.force_authenticate(self.owner)
        self.group = Group.objects.create(owner=self.owner, name="Família")

    def add_people(self, *names):
        for name in names:
            Participant.objects.create(group=self.group, name=name)

    def url(self, suffix=""):
        return f"/api/groups/{self.group.admin_token}/{suffix}"

    def draw(self):
        return self.client.post(self.url("draw/"))

    def test_draw_requires_three_participants(self):
        self.add_people("Ana", "Bruno")
        response = self.draw()
        self.assertEqual(response.status_code, 400)
        self.assertIn("3 participantes", response.data["detail"])

    def test_draw_is_a_derangement(self):
        self.add_people("Ana", "Bruno", "Carla", "Davi", "Eva")
        response = self.draw()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_drawn"])

        people = list(self.group.participants.all())
        assigned = [p.assigned_to_id for p in people]
        self.assertTrue(all(p.assigned_to_id and p.assigned_to_id != p.id for p in people))
        self.assertEqual(len(set(assigned)), len(people))

    def test_group_payload_does_not_expose_assignments(self):
        self.add_people("Ana", "Bruno", "Carla")
        response = self.draw()
        for participant in response.data["participants"]:
            self.assertNotIn("assigned_to", participant)

    def reveal_url(self, participant):
        return f"/api/reveal/{participant.token}/"

    def test_opening_link_does_not_reveal_or_mark_viewed(self):
        self.add_people("Ana", "Bruno", "Carla")
        self.draw()
        ana = self.group.participants.get(name="Ana")

        self.client.force_authenticate(None)
        response = self.client.get(self.reveal_url(ana))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["participant_name"], "Ana")
        self.assertTrue(response.data["is_drawn"])
        self.assertFalse(response.data["has_viewed"])
        self.assertNotIn("assigned_name", response.data)
        ana.refresh_from_db()
        self.assertIsNone(ana.viewed_at)

    def test_reveal_marks_viewed_only_once(self):
        self.add_people("Ana", "Bruno", "Carla")
        self.draw()
        ana = self.group.participants.get(name="Ana")

        self.client.force_authenticate(None)
        response = self.client.post(self.reveal_url(ana))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assigned_name"], ana.assigned_to.name)
        self.assertNotEqual(response.data["assigned_name"], "Ana")
        ana.refresh_from_db()
        first_view = ana.viewed_at
        self.assertIsNotNone(first_view)

        self.client.post(self.reveal_url(ana))
        ana.refresh_from_db()
        self.assertEqual(ana.viewed_at, first_view)
        self.assertTrue(self.client.get(self.reveal_url(ana)).data["has_viewed"])

    def test_link_before_draw_allows_wishlist_but_not_reveal(self):
        self.add_people("Ana", "Bruno", "Carla")
        ana = self.group.participants.get(name="Ana")

        self.client.force_authenticate(None)
        response = self.client.get(self.reveal_url(ana))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_drawn"])
        self.assertEqual(self.client.post(self.reveal_url(ana)).status_code, 400)
        self.assertEqual(
            self.client.patch(self.reveal_url(ana), {"wishlist": "Livro"}).status_code, 200
        )

    def test_participant_edits_own_wishlist(self):
        self.add_people("Ana", "Bruno", "Carla")
        self.draw()
        ana = self.group.participants.get(name="Ana")
        santa = self.group.participants.get(assigned_to=ana)

        self.client.force_authenticate(None)
        response = self.client.patch(
            self.reveal_url(ana), {"wishlist": "  Caneca azul, chocolate  "}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["wishlist"], "Caneca azul, chocolate")
        self.assertNotIn("assigned_name", response.data)

        # Quem tirou a Ana vê a lista nova ao revelar.
        revealed = self.client.post(self.reveal_url(santa))
        self.assertEqual(revealed.data["assigned_wishlist"], "Caneca azul, chocolate")

        too_long = self.client.patch(self.reveal_url(ana), {"wishlist": "x" * 1001})
        self.assertEqual(too_long.status_code, 400)
        cleared = self.client.patch(self.reveal_url(ana), {"wishlist": ""})
        self.assertEqual(cleared.data["wishlist"], "")

    def test_reveal_ignores_stale_login_token(self):
        self.add_people("Ana", "Bruno", "Carla")
        self.draw()
        ana = self.group.participants.get(name="Ana")

        self.client.force_authenticate(None)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer token-vencido")
        self.assertEqual(self.client.get(self.reveal_url(ana)).status_code, 200)
        self.assertEqual(self.client.post(self.reveal_url(ana)).status_code, 200)

    def test_invalid_reveal_link(self):
        self.client.force_authenticate(None)
        response = self.client.get("/api/reveal/00000000-0000-4000-8000-000000000000/")
        self.assertEqual(response.status_code, 404)

    def test_mark_link_sent(self):
        self.add_people("Ana", "Bruno", "Carla")
        ana = self.group.participants.get(name="Ana")

        before_draw = self.client.post(self.url(f"participants/{ana.id}/sent/"))
        self.assertEqual(before_draw.status_code, 400)

        self.draw()
        response = self.client.post(self.url(f"participants/{ana.id}/sent/"))
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.data["link_sent_at"])

    def test_undo_draw_unlocks_list_and_keeps_links(self):
        self.add_people("Ana", "Bruno", "Carla")
        tokens_before = set(self.group.participants.values_list("token", flat=True))
        self.draw()
        ana = self.group.participants.get(name="Ana")
        self.client.post(self.url(f"participants/{ana.id}/sent/"))
        Participant.objects.filter(id=ana.id).update(viewed_at="2026-12-01T10:00:00Z")

        response = self.client.delete(self.url("draw/"))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_drawn"])

        ana.refresh_from_db()
        self.assertIsNone(ana.assigned_to)
        self.assertIsNone(ana.viewed_at)
        self.assertIsNotNone(ana.link_sent_at)
        self.assertEqual(set(self.group.participants.values_list("token", flat=True)), tokens_before)

        added = self.client.post(self.url("participants/"), {"name": "Davi"})
        self.assertEqual(added.status_code, 201)

    def test_undo_without_draw_fails(self):
        self.assertEqual(self.client.delete(self.url("draw/")).status_code, 400)

    def test_other_user_cannot_touch_group(self):
        self.add_people("Ana", "Bruno", "Carla")
        intruder = User.objects.create_user("x@teste.com", "x@teste.com", "SenhaForte#2026")
        self.client.force_authenticate(intruder)
        self.assertEqual(self.client.get(self.url()).status_code, 404)
        self.assertEqual(self.draw().status_code, 404)
        self.assertEqual(self.client.delete(self.url("draw/")).status_code, 404)

    # ---------- Dados da festa, edição e exclusão ----------

    def test_create_group_with_party_details(self):
        response = self.client.post(
            "/api/groups/new/",
            {
                "name": "Amigos",
                "event_date": "2026-12-20",
                "event_time": "19:30",
                "location": "Bar do Zé",
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["event_date"], "2026-12-20")
        self.assertEqual(response.data["event_time"][:5], "19:30")
        self.assertEqual(response.data["location"], "Bar do Zé")

    def test_party_time_requires_date(self):
        response = self.client.post("/api/groups/new/", {"name": "Amigos", "event_time": "19:30"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("event_date", response.data)

        # Na edição, apagar a data e manter o horário também é recusado.
        self.client.patch(self.url(), {"event_date": "2026-12-24", "event_time": "20:00"})
        response = self.client.patch(self.url(), {"event_date": None}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_edit_group_after_draw_shows_on_reveal(self):
        self.add_people("Ana", "Bruno", "Carla")
        self.draw()
        response = self.client.patch(
            self.url(),
            {
                "name": "Família Silva",
                "event_date": "2026-12-24",
                "event_time": "20:00",
                "location": "Casa da vó",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_drawn"])
        self.assertEqual(response.data["name"], "Família Silva")

        ana = self.group.participants.get(name="Ana")
        self.client.force_authenticate(None)
        reveal = self.client.get(f"/api/reveal/{ana.token}/").data
        self.assertEqual(reveal["group_name"], "Família Silva")
        self.assertEqual(reveal["event_date"], "2026-12-24")
        self.assertEqual(reveal["event_time"], "20:00")
        self.assertEqual(reveal["location"], "Casa da vó")

    def test_group_name_cannot_be_blank(self):
        response = self.client.patch(self.url(), {"name": "   "})
        self.assertEqual(response.status_code, 400)

    def test_delete_group_removes_participants_and_links(self):
        self.add_people("Ana", "Bruno", "Carla")
        self.draw()
        token = self.group.participants.get(name="Ana").token

        self.assertEqual(self.client.delete(self.url()).status_code, 204)
        self.assertFalse(Group.objects.filter(id=self.group.id).exists())
        self.assertFalse(Participant.objects.filter(token=token).exists())
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(f"/api/reveal/{token}/").status_code, 404)

    def test_edit_participant(self):
        self.add_people("Ana", "Bruno", "Carla")
        bruno = self.group.participants.get(name="Bruno")
        url = self.url(f"participants/{bruno.id}/")

        response = self.client.patch(url, {"name": "  Bruna  ", "wishlist": "Vinho"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Bruna")
        self.assertEqual(response.data["wishlist"], "Vinho")

        # Mesmo nome de outra pessoa (sem diferenciar maiúsculas) é recusado...
        self.assertEqual(self.client.patch(url, {"name": "ana"}).status_code, 400)
        # ...mas a própria pessoa pode só ajustar maiúsculas.
        self.assertEqual(self.client.patch(url, {"name": "BRUNA"}).status_code, 200)
        self.assertEqual(self.client.patch(url, {"name": ""}).status_code, 400)

    def test_rename_after_draw_keeps_result(self):
        self.add_people("Ana", "Bruno", "Carla")
        self.draw()
        bruno = self.group.participants.get(name="Bruno")
        santa = self.group.participants.get(assigned_to=bruno)

        response = self.client.patch(self.url(f"participants/{bruno.id}/"), {"name": "Bruno Lima"})
        self.assertEqual(response.status_code, 200)

        santa.refresh_from_db()
        self.assertEqual(santa.assigned_to_id, bruno.id)
        self.client.force_authenticate(None)
        revealed = self.client.post(f"/api/reveal/{santa.token}/").data
        self.assertEqual(revealed["assigned_name"], "Bruno Lima")

    def test_other_user_cannot_edit_or_delete(self):
        self.add_people("Ana", "Bruno", "Carla")
        ana = self.group.participants.get(name="Ana")
        intruder = User.objects.create_user("y@teste.com", "y@teste.com", "SenhaForte#2026")
        self.client.force_authenticate(intruder)

        self.assertEqual(self.client.patch(self.url(), {"name": "Hackeado"}).status_code, 404)
        self.assertEqual(self.client.delete(self.url()).status_code, 404)
        self.assertEqual(
            self.client.patch(self.url(f"participants/{ana.id}/"), {"name": "X"}).status_code, 404
        )
        self.group.refresh_from_db()
        self.assertEqual(self.group.name, "Família")


import io
import tempfile
import uuid
from pathlib import Path

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

STRONG_PASSWORD = "SenhaForte#2026"


def png_bytes():
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8), "green").save(buffer, format="PNG")
    return buffer.getvalue()


class AccountTests(APITestCase):
    def register(self, **data):
        payload = {"name": "Ana Souza", "email": "ana@email.com", "password": STRONG_PASSWORD, **data}
        return self.client.post("/api/auth/register/", payload, format="json")

    def login(self, email, password=STRONG_PASSWORD):
        return self.client.post("/api/auth/login/", {"username": email, "password": password}, format="json")

    def test_register_normalizes_email_and_login_ignores_case(self):
        response = self.register(name="  Ana Souza ", email=" Ana@Email.COM ")
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get()
        self.assertEqual((user.username, user.email, user.first_name), ("ana@email.com", "ana@email.com", "Ana Souza"))
        self.assertNotIn("password", response.data)

        self.assertEqual(self.login("ANA@email.com").status_code, 200)
        self.assertIn("access", self.login(" ana@email.com ").data)
        self.assertEqual(self.login("ana@email.com", "senha-errada").status_code, 401)

    def test_duplicate_email_is_a_clear_error_not_a_crash(self):
        self.register()
        response = self.register(email="ANA@email.com")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["email"], ["Já existe uma conta com este e-mail."])
        self.assertEqual(User.objects.count(), 1)

    def test_weak_passwords_are_rejected(self):
        for weak in ["12345678", "abc", "senha123", "anasouza1"]:
            response = self.register(email=f"{uuid.uuid4().hex}@email.com", password=weak)
            self.assertEqual(response.status_code, 400, weak)
            self.assertTrue(response.data["password"], weak)
        self.assertEqual(User.objects.count(), 0)

    def test_name_and_valid_email_are_required(self):
        self.assertIn("name", self.register(name="   ").data)
        self.assertIn("email", self.register(email="nao-e-email").data)

    def test_login_still_works_for_accounts_created_with_uppercase(self):
        User.objects.create_user("Bia@Email.com", "Bia@Email.com", STRONG_PASSWORD)
        self.assertEqual(self.login("bia@email.com").status_code, 200)


class ProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("org@teste.com", "org@teste.com", STRONG_PASSWORD, first_name="Org")
        self.client.force_authenticate(self.user)
        self.media = tempfile.TemporaryDirectory()
        self.addCleanup(self.media.cleanup)
        override = override_settings(MEDIA_ROOT=self.media.name)
        override.enable()
        self.addCleanup(override.disable)

    def put(self, data):
        return self.client.put("/api/auth/me/", data, format="multipart")

    def test_accepts_a_real_image(self):
        response = self.put({"avatar": SimpleUploadedFile("foto.png", png_bytes(), "image/png")})
        self.assertEqual(response.status_code, 200, response.data)
        self.assertTrue(response.data["avatar"].endswith(".png"))
        # A foto é servida também em produção (antes só aparecia com DEBUG ligado).
        path = response.data["avatar"].split("/media/", 1)[1]
        served = self.client.get(f"/media/{path}")
        served.close()  # libera o arquivo (no Windows a pasta temporária não apaga com ele aberto)
        self.assertEqual(served.status_code, 200)

    def test_rejects_files_that_are_not_images(self):
        fake = SimpleUploadedFile("foto.png", b"<html><script>alert(1)</script></html>", "image/png")
        self.assertEqual(self.put({"avatar": fake}).data["detail"], "Este arquivo não é uma imagem válida.")
        html = SimpleUploadedFile("pagina.html", png_bytes(), "text/html")
        self.assertEqual(self.put({"avatar": html}).status_code, 400)
        huge = SimpleUploadedFile("grande.png", b"0" * (2 * 1024 * 1024 + 1), "image/png")
        self.assertEqual(self.put({"avatar": huge}).data["detail"], "A foto pode ter no máximo 2 MB.")
        self.user.profile.refresh_from_db()
        self.assertFalse(self.user.profile.avatar)

    def test_new_password_follows_the_same_rules(self):
        self.assertEqual(self.put({"current_password": "errada", "new_password": "OutraSenha#2026"}).status_code, 400)
        self.assertEqual(self.put({"current_password": STRONG_PASSWORD, "new_password": "123"}).status_code, 400)
        self.assertEqual(self.put({"current_password": STRONG_PASSWORD, "new_password": "OutraSenha#2026"}).status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("OutraSenha#2026"))

    def test_invalid_fields_save_nothing(self):
        User.objects.create_user("outra@teste.com", "outra@teste.com", STRONG_PASSWORD)
        self.assertEqual(self.put({"email": "OUTRA@teste.com"}).data["detail"], "Já existe uma conta com este e-mail.")
        self.assertEqual(self.put({"name": "Novo nome", "phone": "9" * 21}).status_code, 400)
        self.assertEqual(self.put({"name": "  "}).status_code, 400)
        self.user.refresh_from_db()
        self.assertEqual((self.user.first_name, self.user.email), ("Org", "org@teste.com"))


class ProductionRoutesTests(TestCase):
    def setUp(self):
        dist = tempfile.TemporaryDirectory()
        self.addCleanup(dist.cleanup)
        Path(dist.name, "index.html").write_text(
            "<!doctype html><html><head><title>Amigo Secreto</title></head><body><div id=root>app</div></body></html>",
            encoding="utf-8",
        )
        override = override_settings(FRONTEND_DIST_DIR=Path(dist.name))
        override.enable()
        self.addCleanup(override.disable)

    def test_health(self):
        response = self.client.get("/api/health/")
        self.assertEqual((response.status_code, response.json()), (200, {"status": "ok"}))

    def test_frontend_routes_get_the_react_app(self):
        for path in ["/", "/dashboard", f"/revelar/{uuid.uuid4()}", f"/grupos/{uuid.uuid4()}"]:
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200, path)
            self.assertContains(response, "<div id=root>app</div>")
            self.assertEqual(response["Cache-Control"], "no-cache")

    def test_link_preview_image_has_the_full_address(self):
        html = self.client.get("/revelar/abc", HTTP_HOST="localhost").content.decode()
        self.assertIn('<meta property="og:image" content="http://localhost/og-image.jpg" />', html)
        self.assertEqual(html.count('property="og:image"'), 1)

    def test_api_and_admin_are_not_swallowed_by_the_frontend(self):
        self.assertEqual(self.client.get("/api/rota-que-nao-existe/").status_code, 404)
        self.assertEqual(self.client.get("/admin/").status_code, 302)  # tela de login do admin

    def test_without_frontend_build_returns_404(self):
        with override_settings(FRONTEND_DIST_DIR=Path(tempfile.gettempdir(), "nao-existe-" + uuid.uuid4().hex)):
            self.assertEqual(self.client.get("/dashboard").status_code, 404)
