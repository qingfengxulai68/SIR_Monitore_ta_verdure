# 🌱 Terrarium API - Système IoT de Monitoring de Plantes

Backend pour la gestion du terrarium, propulsé par **FastAPI**, **SQLModel** et **uv**.

## ✨ Fonctionnalités

- 🔐 **Authentification**: JWT pour utilisateurs, API Key pour communication M2M (ESP32)
- 🌱 **Gestion des Plantes**: CRUD avec seuils de capteurs personnalisables
- 🖥️ **Gestion des Modules**: Enregistrement et suivi du statut de connectivité
- 📊 **Ingestion de Données**: Réception temps réel des données des capteurs
- ⚡ **WebSocket**: Mises à jour en temps réel (statut plantes, connectivité modules)
- � **Historique**: Données capteurs horodatées
- ⏱️ **Heartbeat**: Surveillance automatique de la connectivité des modules

## 📁 Structure du Projet

```
app/
├── main.py              # Point d'entrée FastAPI
├── database.py          # Setup base de données
├── websocket.py         # Handler WebSocket
├── auth/                # Authentification
│   ├── api_key.py       # Vérification API Key (ingestion)
│   └── jwt.py           # Utilitaires JWT
├── models/              # Modèles SQLModel
│   ├── user.py
│   ├── module.py
│   ├── plant.py
│   ├── settings.py
│   └── values.py
├── routers/             # Routes API
│   ├── auth.py          # /auth/*
│   ├── modules.py       # /modules/*
│   ├── plants.py        # /plants/*
│   ├── settings.py      # /settings/*
│   └── ingestion.py     # /ingestion/*
├── schemas/             # Schémas Pydantic
│   ├── auth.py
│   ├── module.py
│   ├── plant.py
│   ├── settings.py
│   ├── values.py
│   └── websocket.py
└── tasks/               # Tâches de fond
    └── heartbeat.py     # Vérification heartbeat modules
```

## ⚡ Prérequis

Ce projet utilise [uv](https://github.com/astral-sh/uv) pour la gestion ultra-rapide du projet Python.

```bash
pip install uv
```

## 🚀 Développement (Local)

1. **Configurer l'environnement**

   ```bash
   # Créer un fichier .env avec les variables suivantes:
   cat > .env << 'EOF'
   # Application
   APP_NAME="Terrarium API"
   DATABASE_URL="sqlite:///./terrarium.db"
   DEBUG="True"

   # JWT Authentication
   JWT_SECRET_KEY="your-super-secret-key-change-in-production"
   JWT_ALGORITHM="HS256"
   JWT_EXPIRATION_HOURS="24"

   # API Key for ESP32 ingestion
   API_KEY="your-api- --port 8000key-change-in-production"

   # Admin User (created on first run)
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="admin123"

   # Module Heartbeat
   HEARTBEAT_TIMEOUT_SECONDS="120"
   HEARTBEAT_CHECK_INTERVAL_SECONDS="60"

   # Sensor Value Ranges (for validation)
   SOIL_MOIST_MIN="0"
   SOIL_MOIST_MAX="100"
   HUMIDITY_MIN="0"
   HUMIDITY_MAX="100"
   LIGHT_MIN="0"
   LIGHT_MAX="50000"
   TEMP_MIN="0"
   TEMP_MAX="50"
   EOF
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
