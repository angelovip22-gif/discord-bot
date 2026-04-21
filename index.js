const { Client } = require("discord.js-selfbot-v13");
const fs = require("fs");

const TOKEN = process.env.DISCORD_TOKEN;
const GAME = process.env.DISCORD_GAME  "Minecraft";
const STATUS = process.env.DISCORD_STATUS  "dnd";
const TIMESTAMP_FILE = "/tmp/discord_start.txt";

if (!TOKEN) {
  console.error("DISCORD_TOKEN manquant !");
  process.exit(1);
}

function getStartTimestamp() {
  try {
    const saved = fs.readFileSync(TIMESTAMP_FILE, "utf-8").trim();
    const ts = parseInt(saved, 10);
    if (!isNaN(ts) && ts > 0) return ts;
  } catch {}
  const now = Date.now();
  try { fs.writeFileSync(TIMESTAMP_FILE, String(now)); } catch {}
  return now;
}

const startTimestamp = getStartTimestamp();
let client = null;

function applyPresence() {
  if (!client || !client.user) return;
  client.user.setPresence({
    status: STATUS,
    activities: [{ name: GAME, type: 0, startTimestamp, applicationId: "356875570916753438" }],
  });
}

function connect() {
  if (client) { try { client.destroy(); } catch {} }
  client = new Client({ checkUpdate: false });

  client.on("ready", () => {
    console.log(Connecté: ${client.user.tag});
    applyPresence();
    setInterval(applyPresence, 60000);
  });

  client.on("disconnect", () => {
    console.log("Déconnecté, reconnexion dans 10s...");
    setTimeout(connect, 10000);
  });

  client.on("error", (err) => {
    console.error("Erreur:", err.message);
    setTimeout(connect, 10000);
  });

  client.login(TOKEN).catch((err) => {
    console.error("Échec connexion:", err.message);
    setTimeout(connect, 10000);
  });
}

connect();
