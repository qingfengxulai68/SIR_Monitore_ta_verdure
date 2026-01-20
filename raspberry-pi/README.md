# 🌿 SIR - Monitore ta verdure

## 🏗️ Architecture Docker

Le projet est conteneurisé avec Docker Compose et orchestre les services suivants :

- **database** : Base de données PostgreSQL pour stocker les mesures, utilisateurs et configurations.
- **backend** : API REST développée en Python (FastAPI) qui gère la logique métier, l'authentification et l'ingestion des données.
- **frontend** : Interface utilisateur monopage (SPA) réalisée en React.
- **proxy** : Serveur Nginx qui expose le projet sur le port `80`. Il sert l'interface frontend et redirige les requêtes API vers le backend.
- **tunnel** : Service Ngrok permettant d'exposer votre application locale sur internet (utile pour les webhooks Discord ou l'accès à distance).

## ⚙️ Configuration (.env)

Avant de lancer le projet, vous devez créer un fichier `.env` à la racine (au même niveau que ce README) pour configurer les services.

Voici les variables d'environnement à définir :

| Catégorie            | Variable                | Description                                                                               |
| :------------------- | :---------------------- | :---------------------------------------------------------------------------------------- |
| **Environnement**    | `ENV`                   | `dev` ou `prod`. (Ex: `prod`)                                                             |
| **Base de données**  | `POSTGRES_USER`         | Identifiant de la base de données.                                                        |
|                      | `POSTGRES_PASSWORD`     | Mot de passe de la base de données.                                                       |
|                      | `POSTGRES_DB`           | Nom de la base de données.                                                                |
| **Sécurité**         | `JWT_SECRET_KEY`        | Clé secrète pour signer les jetons d'authentification.                                    |
|                      | `API_KEY`               | Clé secrète pour enregistrer des données.                                                 |
| **Admin par défaut** | `ADMIN_USERNAME`        | Nom d'utilisateur pour le compte administrateur.                                          |
|                      | `ADMIN_PASSWORD`        | Mot de passe pour le compte administrateur.                                               |
| **Tunnel ngrok**     | `NGROK_AUTHTOKEN`       | Token d'authentification [ngrok](https://dashboard.ngrok.com/get-started/your-authtoken). |
| **Notifications**    | `DISCORD_CLIENT_ID`     | ID Client pour l'intégration Discord.                                                     |
|                      | `DISCORD_CLIENT_SECRET` | Secret Client pour l'intégration Discord.                                                 |
|                      | `DISCORD_REDIRECT_URI`  | URL de callback pour l'OAuth2 Discord.                                                    |
|                      | `EMAIL`                 | Adresse email pour l'envoi d'alertes.                                                     |
|                      | `EMAIL_PASSWORD`        | Mot de passe d'application pour l'email.                                                  |

## 🚀 Installation et Démarrage

Une fois votre fichier `.env` prêt, suivez la méthode adaptée à votre matériel :

### 💻 Option A : Sur Ordinateur (Windows/Mac/Linux)

1. **Pré-requis** : Installez [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. **Lancement** : Dans un terminal à la racine du dossier, exécutez :
   ```bash
   docker compose up --build -d
   ```
3. **Accès** :
   - Sur la même machine : [http://localhost](http://localhost)
   - Depuis le réseau local : `http://<IP_DE_VOTRE_ORDI>`

### 🍓 Option B : Sur Raspberry Pi

1. **Installation de Docker** (sur le Pi) :

   ```bash
   curl -sSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

2. **Redémarrer le Raspberry Pi**

3. **Déploiement** (depuis votre ordinateur) :
   Transférez le dossier du projet vers le Pi (changez `user` et l'IP selon votre configuration) :

   ```bash
   scp -r ./raspberry-pi user@192.168.1.X:~/monitore-ta-verdure
   ```

4. **Lancement** (sur le Pi) :

   ```bash
   cd ~/monitore-ta-verdure
   docker compose up --build -d
   ```

5. **Accès** :
   Depuis n'importe quel appareil du réseau : `http://raspberrypi.local` (ou via l'IP du Pi).

#### 🔧 Configuration IPv4 (Requis pour raspberrypi.local)

Pour que l'adresse `http://raspberrypi.local` fonctionne correctement sur tous les appareils, il est nécessaire de désactiver l'IPv6 dans le service de découverte (avahi).

1. Connectez-vous à votre Pi (en SSH ou avec clavier/écran).

2. Ouvrez le fichier de configuration d'Avahi :

   ```bash
   sudo nano /etc/avahi/avahi-daemon.conf
   ```

```bash
docker compose down
```
#### 3.2 Sur Raspberry pi
1. Installer Docker depuis le terminal du raspberry pi :
```bash
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

2. Créer un fichier SWAP
Si ton Raspberry Pi a 2 Go ou 4 Go de RAM, la compilation peut quand même saturer la mémoire physique. Créer un fichier d'échange (Swap) sur la carte SD permet de simuler de la RAM supplémentaire.

Exécute ces commandes sur ton Raspberry Pi :
```bash
# Désactive le swap actuel
sudo dpswapoff
# Modifie la taille (passe de 100 à 2048)
sudo nano /etc/dphys-swapfile
```
Change la ligne CONF_SWAPSIZE=100 en CONF_SWAPSIZE=2048. Enregistre (Ctrl+O) et quitte (Ctrl+X), puis :
```bash
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```
3. Modifier le ficher configuration pour forcer ipv4 sur Avahi
```bash
sudo nano /etc/avahi/avahi-daemon.conf
```
Cherchez la section `[server]` et modifie (ou ajoute) les lignes suivantes :
```plaintext
[server]
use-ipv4=yes
use-ipv6=no
publish-a-on-ipv6=no
publish-aaaa-on-ipv6=no
```

4. Sauvegardez, quittez et redémarrez le service Avahi pour appliquer le changement :
```bash
sudo systemctl restart avahi-daemon
```

5. Redémarrer le Raspberry pi

6. Copier le dossier depuis le terminal de l'ordinateur vers le pi :
```bash
scp -r ./raspberry-pi projetsir@172.20.10.2:~/Documents/
```

7. Puis sur le terminal du Raspberry pi dans le dossier raspberry-pi lancer Docker :
```bash
docker compose up --build -d
```
8. Sur le navigateur web de l'ordi, accéder au site avec l'url : http://172.20.10.2:3000 ou http://raspberrypi.local:3000 

> **Arrêter l'application :**
>
> ```bash
> docker compose down
> ```

## 🌐 Accès Distant

Une fois le conteneur lancé, grâce au service **Ngrok** intégré (conteneur `tunnel`), vous pouvez accéder à votre tableau de bord depuis n'importe où (smartphone, 4G, autre réseau) via l'adresse suivante :

👉 **https://noriko-presentable-rowan.ngrok-free.dev/**
