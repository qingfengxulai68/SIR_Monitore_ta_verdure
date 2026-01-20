# 🌿 SIR - Monitore ta verdure

Ce projet permet de monitorer des plantes via des capteurs (ESP32) et une interface web.

Ce dossier contient toute la partie serveur (backend) et interface utilisateur (frontend), conteneurisés avec Docker pour faciliter le lancement.

## 🚀 Installation et Lancement

Pour éviter d'avoir à installer Python, Node.js, et des bases de données sur votre machine, nous utilisons **Docker**. C'est un outil qui permet de lancer tout le système dans des "boîtes" isolées et pré-configurées.

### 1. Pré-requis

- **Docker Desktop** : Assurez-vous d'avoir installé et lancé [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### 2. Configuration (.env)

Avant de lancer les "boîtes" isolées (conteneurs), il est **indispensable** de les configurer pour qu'elles puissent communiquer entre elles.

#### Signification des variables

| Variable            | Description                                                                |
| :------------------ | :------------------------------------------------------------------------- |
| `POSTGRES_USER`     | Nom d'utilisateur pour la base de données PostgreSQL.                      |
| `POSTGRES_PASSWORD` | Mot de passe pour la base de données PostgreSQL.                           |
| `POSTGRES_DB`       | Nom de la base de données PostgreSQL.                                      |
| `JWT_SECRET_KEY`    | Clé secrète pour sécuriser générer les tokens des sessions utilisateurs.   |
| `API_KEY`           | Clé utilisée par les ESP32 pour s'authentifier lors de l'envoi de données. |
| `ADMIN_USERNAME`    | Nom d'utilisateur (par défaut) pour accéder au tableau de bord.            |
| `ADMIN_PASSWORD`    | Mot de passe administrateur (par défaut).                                  |
| `BACKEND_BASE_URL`  | Adresse du serveur (Backend) utilisée par l'interface.                     |

#### Création du fichier

1. Créez un fichier nommé `.env` à la racine de ce dossier (`raspberry-pi/.env`).
2. Voici un exemple prêt à l'emploi :

```env
# Database configuration
POSTGRES_USER=admin
POSTGRES_PASSWORD=password123
POSTGRES_DB=app_db

# JWT settings (Secret pour la sécurité)
JWT_SECRET_KEY=dHgXvYRaWUiAY6j3q4Qora5b7Qfbg7dpgw1dwLOriq0

# API Key for ingestion endpoints (Clé pour que les ESP32 puissent parler au serveur)
API_KEY=H8XIds5mGjfMaLYA-BWmKV9r5DX2aCdyu2nBVPElEkM

# Initial admin user credentials (Compte admin par défaut)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=demo1234

# Frontend configuration (Configuration de l'interface)
BACKEND_BASE_URL=http://localhost:8000
```

### 3. Lancer l'application
#### 3.1 Sur oridnateur
Ouvrez un terminal dans ce dossier (`raspberry-pi`) et lancez la commande suivante :

```bash
docker compose up --build -d
```

_Explication :_

- `up` : Démarre le système.
- `--build` : Construit les "images" (les versions du logiciel) pour être sûr d'avoir la dernière version.
- `-d` : "Detached", lance le tout en arrière-plan pour ne pas bloquer votre terminal.

Attendez quelques instants que tout démarre.
Vous pouvez ensuite accéder à l'interface via votre navigateur : **[http://localhost:3000](http://localhost:3000)**

Pour se connecter :

- Identifiant : `admin`
- Mot de passe : `demo1234`

Pour arrêter le système :

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
3. Redémarrer le Raspberry pi

4. Copier le dossier depuis le terminal de l'ordinateur vers le pi :
```bash
scp -r ./raspberry-pi projetsir@172.20.10.2:~/Documents/
```
4. Puis sur le terminal du Raspberry pi dans le dossier raspberry-pi lancer Docker :
```bash
docker compose up --build -d
```
5. Sur le navigateur web de l'ordi, accéder au site avec l'url : http://172.20.10.2:3000 


## 🧪 Bonus : Simuler un ESP32

Si vous n'avez pas de capteur ESP32 sous la main mais que vous voulez voir des données arriver en temps réel sur le tableau de bord, nous avons prévu un script de simulation.

### Pré-requis pour la simulation

Il vous faut **Python** installé sur votre machine.

### Lancer la simulation

1. Assurez-vous que le site (backend) est lancé via Docker (étape précédente).
2. Ouvrez un terminal dans ce dossier (`raspberry-pi`).
3. Lancez le script :

```bash
python ingestion/simulate_esp32.py
```

Le script va commencer à envoyer de fausses données (température, humidité, luminosité...) toutes les 5 secondes. Vous devriez les voir apparaître sur l'interface web.

Pour arrêter le script, faites simplement `Ctrl+C` dans le terminal.
