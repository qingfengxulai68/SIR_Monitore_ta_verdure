# 🌱 Terrarium API - Système IoT de Monitoring de Plantes

Backend pour la gestion du terrarium, propulsé par **FastAPI**, **SQLModel** et **uv**.

## ✨ Fonctionnalités

- 🔐 **Authentification**: JWT pour utilisateurs, API Key pour communication M2M (ESP32)
- 🌱 **Gestion des Plantes**: CRUD avec seuils de capteurs personnalisables
- 🖥️ **Gestion des Modules**: Enregistrement et suivi du statut de connectivité
- 📊 **Ingestion de Données**: Réception temps réel des données des capteurs
- ⚡ **WebSocket**: Mises à jour en temps réel (statut plantes, connectivité modules)
- 🔔 **Alertes Discord**: Notifications webhook avec throttling (1/heure par plante)
- 📈 **Historique**: Données capteurs avec échantillonnage automatique

## 📁 Structure du Projet

```
app/
├── main.py              # Point d'entrée FastAPI
├── config.py            # Configuration (env variables)
├── database.py          # Setup base de données
├── websocket.py         # Handler WebSocket
├── auth/                # Authentification
│   ├── api_key.py       # Vérification API Key (ingestion)
│   ├── dependencies.py  # Dépendances FastAPI
│   └── jwt.py           # Utilitaires JWT
├── models/              # Modèles SQLModel
│   ├── user.py
│   ├── module.py
│   ├── plant.py
│   ├── threshold.py
│   ├── sensor_data.py
│   ├── settings.py
│   └── alert_history.py
├── routers/             # Routes API
│   ├── auth.py          # /auth/*
│   ├── modules.py       # /modules/*
│   ├── plants.py        # /plants/*
│   ├── settings.py      # /settings/*
│   └── ingestion.py     # /ingestion/*
├── schemas/             # Schémas Pydantic
├── services/            # Logique métier
│   ├── plant_service.py
│   ├── module_service.py
│   ├── alert_service.py
│   └── websocket_manager.py
├── tasks/               # Tâches de fond
│   └── heartbeat.py     # Vérification heartbeat modules
└── utils/
    └── rate_limiter.py  # Rate limiting ingestion
```

## ⚡ Prérequis

Ce projet utilise [uv](https://github.com/astral-sh/uv) pour la gestion ultra-rapide du projet Python.

```bash
pip install uv
```

## 🚀 Développement (Local)

1. **Configurer l'environnement**

   ```bash
   cp .env.example .env
   # Éditer .env avec vos secrets !
   ```

2. **Installer les dépendances**

   ```bash
   uv sync
   ```

3. **Lancer l'application**

   ```bash
   uv run fastapi dev
   ```

L'API sera accessible sur : [http://127.0.0.1:8000](http://127.0.0.1:8000)

## 📚 Documentation API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 Endpoints API

### Authentification (`/auth`)

| Méthode | Endpoint                | Description          | Auth |
| ------- | ----------------------- | -------------------- | ---- |
| POST    | `/auth/login`           | Connexion            | -    |
| POST    | `/auth/register`        | Inscription          | -    |
| POST    | `/auth/change-password` | Changer mot de passe | JWT  |

### Modules (`/modules`)

| Méthode | Endpoint                | Description       | Auth |
| ------- | ----------------------- | ----------------- | ---- |
| GET     | `/modules`              | Liste des modules | JWT  |
| GET     | `/modules?coupled=true` | Modules couplés   | JWT  |

### Plantes (`/plants`)

| Méthode | Endpoint                          | Description       | Auth |
| ------- | --------------------------------- | ----------------- | ---- |
| GET     | `/plants`                         | Liste des plantes | JWT  |
| POST    | `/plants`                         | Créer une plante  | JWT  |
| GET     | `/plants/{id}`                    | Détails plante    | JWT  |
| PUT     | `/plants/{id}`                    | Modifier plante   | JWT  |
| DELETE  | `/plants/{id}`                    | Supprimer plante  | JWT  |
| GET     | `/plants/{id}/history?period=24h` | Historique        | JWT  |

### Paramètres (`/settings`)

| Méthode | Endpoint                   | Description        | Auth |
| ------- | -------------------------- | ------------------ | ---- |
| GET     | `/settings/alerts`         | État des alertes   | JWT  |
| POST    | `/settings/alerts/enable`  | Activer alertes    | JWT  |
| POST    | `/settings/alerts/disable` | Désactiver alertes | JWT  |

### Ingestion (`/ingestion`)

| Méthode | Endpoint                 | Description      | Auth    |
| ------- | ------------------------ | ---------------- | ------- |
| POST    | `/ingestion/sensor-data` | Données capteurs | API Key |

## ⚡ WebSocket

Connecter à `/ws?token=<jwt-token>` pour les mises à jour temps réel.

### Événements Serveur → Client

- `plant:update` - Nouvelles données capteurs
- `plant:offline` - Module déconnecté (timeout)
- `module:status` - Changement statut connectivité

### Événements Client → Serveur

```javascript
// S'abonner aux updates d'une plante
socket.send(JSON.stringify({ event: "subscribe:plant", data: 1 }));

// Se désabonner
socket.send(JSON.stringify({ event: "unsubscribe:plant", data: 1 }));

// Ping (keep-alive)
socket.send(JSON.stringify({ event: "ping" }));
```

## 🐳 Docker

### Construire l'image

```bash
docker build -t terrarium-api .
```

### Lancer le conteneur

```bash
docker run -p 8000:80 --env-file .env terrarium-api
```

## 🔒 Sécurité

1. **Changer tous les secrets** dans `.env`
2. Utiliser **HTTPS** en production
3. Configurer **CORS** appropriément
4. Utiliser des **API Keys** robustes pour M2M

## 🗄️ Base de Données

SQLite pour le développement. Pour PostgreSQL en production:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/terrarium
```
