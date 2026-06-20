# Gallery

A Django backend exposing a JSON API, with a React (Vite + TypeScript) single-page
app as the frontend.

## Layout

- `gallery/`, `images/` — Django project. The frontend talks to it through the
  JSON API under `/api/` (see `images/api.py` and `images/api_urls.py`). Image
  bytes are served by `images/views.py:data` at `/api/images/<id>/data`.
- `frontend/` — Vite + React SPA. Pages live in `frontend/src/pages/`; the typed
  API client is `frontend/src/api.ts`.

## Running in development

Dependencies are managed with [uv](https://docs.astral.sh/uv/). It builds the
virtualenv (`.venv/`) from `pyproject.toml`/`uv.lock` and can fetch a prebuilt
Python for you, so no system build toolchain is required:

```sh
uv sync        # creates .venv and installs locked dependencies
```

Two processes. In one terminal, start Django (serves the API on port 8000):

```sh
uv run python manage.py runserver 8000
```

In another, start the React dev server:

```sh
cd frontend
npm install        # first time only
npm run dev
```

Open the URL Vite prints (default http://localhost:5173). The dev server proxies
`/api` requests to Django, so the browser sees a single same-origin app and no
CORS configuration is needed. Point it at a different backend with
`DJANGO_URL=http://host:port npm run dev`.

## Production build

```sh
cd frontend
npm run build      # outputs static assets to frontend/dist/
```

Serve `frontend/dist/` from any static host (or Django/Nginx) and ensure `/api`
is routed to the Django backend.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/images?mode=random` | Random homepage images |
| GET | `/api/images?mode=recent&page=N` | Recent images, paginated (30/page) |
| GET | `/api/images?tag=<id>` | Images for a tag |
| GET | `/api/images/<id>` | Image detail + tags (increments view count) |
| GET | `/api/images/<id>/data` | Raw image bytes |
| POST | `/api/images/<id>/tags` | Attach a tag (`{tag_id}` or new `{name}`) |
| DELETE | `/api/images/<id>/tags/<tag_id>` | Detach a tag |
| GET | `/api/tags` | All tags with image counts |
| GET | `/api/review` | Unreviewed images + available tags |
| POST | `/api/review/mark` | Mark images reviewed (`{image_ids: [...]}`) |

The mutating endpoints are `@csrf_exempt` since the SPA calls them as a
decoupled client; add token/session auth before exposing this publicly.
