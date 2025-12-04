import React, { useEffect, useState, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";

// Default export React component
export default function PlantMonitor() {
  const [sensors, setSensors] = useState({});
  const [wsStatus, setWsStatus] = useState("DISCONNECTED");
  const [watering, setWatering] = useState(false);
  const [duration, setDuration] = useState(10);
  const wsRef = useRef(null);

  // -----------------------------
  // 1) Fetch /data.json every 2 sec (for local testing)
  // -----------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/data.json")
        .then(res => res.json())
        .then(d => console.log("data.json:", d))
        .catch(() => {});
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  // 2) WebSocket connection
  // -----------------------------
  useEffect(() => {
    const wsUrl =
      (window.location.protocol === "https:" ? "wss://" : "ws://") +
      window.location.hostname +
      ":3001";

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setWsStatus("CONNECTED");
    ws.onclose = () => setWsStatus("DISCONNECTED");
    ws.onerror = () => setWsStatus("ERROR");

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "sensor") {
          setSensors(prev => {
            const copy = { ...prev };
            const id = msg.payload.id;
            if (!copy[id]) copy[id] = { points: [] };
            const p = msg.payload;
            copy[id].points = (copy[id].points || []).concat([p]).slice(-200);
            copy[id].last = p;
            return copy;
          });
        } else if (msg.type === "water") {
          setWatering(msg.payload.active);
        }
      } catch (e) {
        console.error("Invalid ws message", e);
      }
    };

    return () => ws.close();
  }, []);

  // -----------------------------
  // 3) REST API polling fallback
  // -----------------------------
  useEffect(() => {
    let mounted = true;

    const fetchOnce = async () => {
      try {
        const r = await fetch("/api/sensors");
        if (!r.ok) return;
        const arr = await r.json();
        if (!mounted) return;

        const structured = {};
        arr.forEach(s => {
          structured[s.id] = {
            points: (s.history || []).slice(-200),
            last:
              s.last ||
              (s.history && s.history.length
                ? s.history[s.history.length - 1]
                : null)
          };
        });

        setSensors(structured);
      } catch (e) {
        // ignore
      }
    };

    fetchOnce();
    const id = setInterval(fetchOnce, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // -----------------------------
  // 4) Chart keys
  // -----------------------------
  const chartKeys = [
    { key: "temperature", label: "Température de l’air (°C)" },
    { key: "humidity", label: "Humidité de l’air (%)" },
    { key: "soil", label: "Humidité du sol (%)" },
    { key: "light", label: "Intensité lumineuse" },
    { key: "pressure", label: "Pression atmosphérique (hPa)" }
  ];

  const sensorIds = Object.keys(sensors).sort();

  // -----------------------------
  // 5) Watering control
  // -----------------------------
  const handleWater = async (action = "start") => {
    try {
      const r = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, duration: Number(duration) })
      });
      if (!r.ok) throw new Error("failed");
      const data = await r.json();
      setWatering(data.active);
    } catch (e) {
      alert("Failed to contact server: " + e.message);
    }
  };

  // -----------------------------
  // 6) UI
  // -----------------------------
  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Plant Monitor — Tableau de bord des capteurs</h1>
        <div className="mt-2 text-sm text-gray-600">
          WebSocket: {wsStatus} • Arrosage : {watering ? 'En cours' : 'Arrêté'}
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2 p-4 bg-white rounded-2xl shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Contrôle de l'arrosage</h2>
              <p className="text-sm text-gray-500">
                Cliquez pour démarrer/arrêter l'arrosage. Le serveur enverra la commande à l'actionneur (relais/Raspberry Pi)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="border p-2 rounded"
                style={{ width: 80 }}
              />
              <button
                onClick={() => handleWater("start")}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Commencer l'arrosage
              </button>
              <button
                onClick={() => handleWater("stop")}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Arrêter l'arrosage
              </button>
            </div>
          </div>
        </div>

        {sensorIds.length === 0 && (
          <div className="p-6 bg-white rounded-2xl shadow">
            Aucune donnée de capteur n'a été reçue pour le moment.
          </div>
        )}

        {sensorIds.map((id) => (
          <div key={id} className="p-4 bg-white rounded-2xl shadow">
            <h3 className="font-semibold">
              传感器 {id} • 最新:{" "}
              {sensors[id].last
                ? new Date(sensors[id].last.timestamp * 1000).toLocaleString()
                : "—"}
            </h3>

            <div className="mt-2 grid grid-cols-1 gap-4">
              {chartKeys.map((ch) => (
                <div key={ch.key} style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sensors[id].points.map((p) => ({
                        ...p,
                        time: new Date(p.timestamp * 1000).toLocaleTimeString()
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" minTickGap={20} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={ch.key}
                        name={ch.label}   
                        stroke="#8884d8"
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-6 text-sm text-gray-500">
        Remarque : la page utilise des mises à jour par WebSocket, avec un retour en arrière de sondage toutes les 5 secondes.
      </footer>
    </div>
  );
}
