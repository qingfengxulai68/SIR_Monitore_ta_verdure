# Documentation du backend - Terrarium API

Cette documentation répertorie les endpoints disponibles dans l'API backend (FastAPI), leurs méthodes, schémas d'entrée/sortie, les exigences d'authentification, ainsi que les événements WebSocket déclenchés par chaque action.

## Base

- **Base URL:** `http://<host>:<port>`
- **Health check:** `GET /`
- Réponse: JSON `{ "name": "Terrarium API", "status": "healthy", "version": "1.0.0" }`

## Authentification

- **JWT Bearer:** Les endpoints protégés utilisent un header `Authorization: Bearer <token>`.
- **API Key:** L'ingestion IoT utilise un header `X-API-KEY: <key>`.

## 1. Endpoints REST

### Authentication (préfixe `/auth`)

- **`POST /auth/login`**
  - **Description:** Authentifie un utilisateur et renvoie un token JWT.
  - **WebSocket Broadcast:** Aucun.
  - **Request:** `{ "username": "...", "password": "..." }`
  - **Response (200):** `{ "token": "...", "user": { "id": 1, "username": "..." } }`

- **`POST /auth/change-password`**
  - **Description:** Change le mot de passe de l'utilisateur courant.
  - **Auth:** Bearer JWT.
  - **Request:** `{ "currentPassword": "...", "newPassword": "..." }`
  - **Response:** 204 No Content.

### Ingestion (préfixe `/ingestion`)

- **`POST /ingestion/`**
  - **Description:** Réception des données brutes depuis les modules physiques (ESP32).
  - **Auth:** Header `X-API-KEY`.
  - **WebSocket Broadcast:**
    1. `PLANT_METRICS` (Toujours : diffusion des nouvelles valeurs).
    2. `MODULE_CONNECTION` (Conditionnel : si le module était considéré "Hors ligne", il repasse "En ligne").
  - **Request:**

    ```json
    {
      "moduleId": "ESP32-A1",
      "soilMoist": 45.0,
      "humidity": 60.0,
      "light": 1200,
      "temp": 24.5
    }
    ```

  - **Response:** 204 No Content.

### Modules (préfixe `/modules`)

- **`GET /modules`**
  - **Description:** Récupère l'inventaire complet des modules.
  - **Auth:** Bearer JWT.
  - **Query Params:** `?coupled=true/false` (optionnel).
  - **Response (200):** Liste de `ModuleResponse` :

    ```json
    [
      {
        "id": "ESP32-A1",
        "isOnline": true,
        "coupled": true,
        "coupledPlant": { "id": 12, "name": "Basilic" }
      }
    ]
    ```

- **`DELETE /modules/{module_id}/coupling`**
  - **Description:** Libère un module en supprimant la plante associée.
  - **Auth:** Bearer JWT.
  - **WebSocket Broadcast:**
    1. `ENTITY_CHANGE` (Entity: `module`, Action: `update`) → Le module redevient "Disponible".
    2. `ENTITY_CHANGE` (Entity: `plant`, Action: `delete`) → Si une plante était couplée.
  - **Response:** 204 No Content.

### Plants (préfixe `/plants`)

- **`GET /plants`**
  - **Description:** Récupère toutes les plantes avec leur statut, dernières valeurs et seuils (pour l'initialisation du Dashboard).
  - **Auth:** Bearer JWT.
  - **Response (200):** Liste de `PlantResponse`.

- **`GET /plants/{plant_id}`**
  - **Description:** Récupère une plante spécifique.
  - **Auth:** Bearer JWT.
  - **Response (200):** `PlantResponse`.

- **`POST /plants`**
  - **Description:** Crée une nouvelle plante et y assigne un module.
  - **Auth:** Bearer JWT.
  - **WebSocket Broadcast:**
    1. `ENTITY_CHANGE` (Entity: `plant`, Action: `create`) → Pour afficher la plante.
    2. `ENTITY_CHANGE` (Entity: `module`, Action: `update`, ID: `moduleId`) → Pour marquer le module comme "Assigné" dans l'inventaire.
  - **Request:** `{ "name": "...", "moduleId": "...", "thresholds": { ... } }`
  - **Response (201):** `Response`.

- **`PUT /plants/{plant_id}`**
  - **Description:** Met à jour une plante (nom, seuils ou changement de module).
  - **Auth:** Bearer JWT.
  - **WebSocket Broadcast:**
    1. `ENTITY_CHANGE` (Entity: `plant`, Action: `update`).
    2. _Si changement de module :_ `ENTITY_CHANGE` (Entity: `module`, Action: `update`) pour l'ancien ET le nouveau module.
  - **Request:** `{ "name": "...", "moduleId": "...", "thresholds": { ... } }`
  - **Response :** 204 No Content.

- **`DELETE /plants/{plant_id}`**
  - **Description:** Supprime une plante et libère le module associé.
  - **Auth:** Bearer JWT.
  - **WebSocket Broadcast:**
    1. `ENTITY_CHANGE` (Entity: `plant`, Action: `delete`).
    2. `ENTITY_CHANGE` (Entity: `module`, Action: `update`, ID: `coupledModuleId`) → Le module redevient "Disponible".
  - **Response:** 204 No Content.

### Settings (préfixe `/settings`)

- **`GET /settings/alerts`**
- **`POST /settings/alerts/enable`**
- **`POST /settings/alerts/disable`**

> Gestion standard de la configuration (pas de WebSocket nécessaire).

## 2. WebSocket Protocol (Real-Time)

Le système utilise une connexion unique pour maintenir l'état de l'application synchronisé.

- **Endpoint:** `ws://<host>/ws?token=<jwt_token>`
- **Comportement:** Broadcast (tous les clients connectés reçoivent les messages).

### Types de Messages (Serveur → Client)

#### A. `PLANT_METRICS` (La Donnée)

- **Déclencheur:** Ingestion de nouvelles données capteurs.
- **Utilité Frontend:** Mise à jour **directe (Optimistic)** des jauges, graphiques et statuts d'alerte (sans recharger l'API).

```json
{
  "type": "PLANT_METRICS",
  "payload": {
    "plantId": 12,
    "values": {
      "soilMoist": 45.2,
      "humidity": 60.0,
      "light": 1200,
      "temp": 24.5,
      "timestamp": "2024-01-20T14:30:00Z"
    },
    "status": "alert" // "ok" | "alert" | "offline"
  }
}
```

#### B. `MODULE_CONNECTION` (La Santé)

- **Déclencheur:** Un module envoie une donnée (devient Online) ou expire via Heartbeat/Watchdog (devient Offline).
- **Utilité Frontend:** Mise à jour **directe** des pastilles de connectivité et grisement des plantes liées.

```json
{
  "type": "MODULE_CONNECTION",
  "payload": {
    "moduleId": "ESP32-A1",
    "isOnline": false,
    "coupledPlantId": 12 // (null si pas couplé)
  }
}
```

#### C. `ENTITY_CHANGE` (La Structure)

- **Déclencheur:** Actions CRUD administratives (Création/Modif/Suppression de plantes, Couplage).
- **Utilité Frontend:** Signal d'invalidation (**Refetch**). Le client doit recharger la liste concernée (`GET /plants` ou `GET /modules`) car la structure des données a changé.

```json
{
  "type": "ENTITY_CHANGE",
  "payload": {
    "entity": "plant", // "plant" | "module"
    "action": "update", // "create" | "update" | "delete"
    "id": 12 // (ID de l'entité concernée)
  }
}
```

### Messages Client → Serveur

- `PING`: Keep-alive (Réponse serveur: `PONG`).
