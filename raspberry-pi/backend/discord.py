import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()


def send_discord_message(webhook_url: str, message: str):
    """
    Envoie un message à un salon Discord via un Webhook.
    """
    data = {
        "content": message,
        "username": "Mon Capteur ESP32" # Optionnel : change le nom affiché
    }
    
    try:
        response = requests.post(
            webhook_url, 
            data=json.dumps(data),
            headers={"Content-Type": "application/json"}
        )
        # Vérifie si l'envoi a réussi (code 204 No Content)
        if response.status_code == 204:
            print("Message envoyé avec succès !")
        else:
            print(f"Erreur : {response.status_code}, {response.text}")
    except Exception as e:
        print(f"Une erreur est survenue : {e}")

# --- EXEMPLE D'UTILISATION ---
if __name__ == "__main__":
    URL = os.getenv("DISCORD_WEBHOOK_URL") or "https://discord.com/api/webhooks/your_unique_id_here"
    mon_message = "⚠️ Alerte : Température élevée détectée (28.5°C)"

    send_discord_message(URL, mon_message)