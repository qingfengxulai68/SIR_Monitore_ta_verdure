# 🌱 FastAPI Backend : Système IoT de Monitoring de Plantes

Backend pour la gestion du terrarium, propulsé par **FastAPI** et **uv**.

## ⚡ Prérequis

Ce projet utilise [uv](https://github.com/astral-sh/uv) pour la gestion ultra-rapide du projet Python.

```bash
pip install uv
```

## 🚀 Développement (Local)

1. **Installer les dépendances**
   Cette commande crée l'environnement virtuel et installe les librairies (comme `npm install`).

   ```bash
   uv sync
   ```

2. **Lancer l'application**

   ```bash
   uv run fastapi dev
   ```

L'API sera accessible sur : [http://127.0.0.1:8000](http://127.0.0.1:8000)

> **Note :** Pour ajouter une nouvelle librairie au projet, utilisez `uv add <nom_lib>` au lieu de pip.

## 🐳 Docker

Pour exécuter l'application dans un conteneur isolé :

### 1. Construire l'image

```bash
docker build -t terrarium-api .
```

### 2. Lancer le conteneur

Redirige le port 8000 de votre machine vers le port 80 du conteneur.

```bash
docker run -p 8000:80 terrarium-api
```
