#!/bin/bash

# Sécurité : Arrêter le script si une commande échoue
set -e

# 1. Aller dans le dossier iot-platform
echo "--- Accès au dossier iot-platform ---"
cd ~/monitore-ta-verdure/iot-platform

# 2. Créer et remplir le fichier .env
echo "--- Configuration du fichier .env ---"
# Utilisation de EOF sans indentation pour éviter l'erreur de délimiteur
cat > .env <<EOF
ENV=prod
POSTGRES_USER=admin
POSTGRES_PASSWORD=password123
POSTGRES_DB=app_db
JWT_SECRET_KEY=dHgXvYRaWUiAY6j3q4Qora5b7Qfbg7dpgw1dwLOriq0
API_KEY=H8XIds5mGjfMaLYA-BWmKV9r5DX2aCdyu2nBVPElEkM
ADMIN_USERNAME=admin
ADMIN_PASSWORD=demo1234
NGROK_AUTHTOKEN=38UPcfbwqqSZECAG6BdvBuE1AOF_5RpN511n5BfW56159z3gX
DISCORD_CLIENT_ID=1459208723686756525
DISCORD_CLIENT_SECRET=3vJLZO-I7oDTi_5fJcoebyKxUeDOjDGj
DISCORD_REDIRECT_URI=https://noriko-presentable-rowan.ngrok-free.dev/api/settings/alerts/discord/callback
EMAIL=votrungthien1503@gmail.com
EMAIL_PASSWORD=rakq qszb gkbn vcoo
EOF

echo "✓ Fichier .env créé avec succès."

# 3. Lancer Docker Compose
echo "--- Lancement de Docker Compose ---"
docker compose up -d --build

# Attente du démarrage des services
echo "Attente du démarrage des services (10s)..."
sleep 10

# 4. Aller dans data-bridge
echo "--- Accès au dossier data-bridge ---"
cd ~/monitore-ta-verdure/data-bridge

# 5. Lancer le script Python
echo "--- Lancement du data-bridge ---"
python3 data-bridge.py