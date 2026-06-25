#!/usr/bin/env bun
/**
 * Pixel Fix — Admin Web
 * Uso: bun run admin  →  abre http://localhost:3333
 */

import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CATALOG = path.join(ROOT, "src/data/catalog.ts");
const IMAGES_DIR = path.join(ROOT, "public/images/productos");

fs.mkdirSync(IMAGES_DIR, { recursive: true });

const upload = multer({ dest: IMAGES_DIR });
const app = express();
app.use(express.json());

// ─── Slug helper ──────────────────────────────────────────────────────────────

function nameToSlug(fullName) {
  const model = fullName.replace(/^Google\s+/, "");
  return `equipo-${model.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
}

function partToSlug(name, model) {
  const isBateria  = name.toLowerCase().includes("pila");
  const isOriginal = name.toLowerCase().includes("original");
  const qualityTag = isOriginal ? "original" : "replica-excelente";
  const rawSlug    = model.toLowerCase().replace(/\s*\/\s*/g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `${isBateria ? "bateria" : "pantalla"}-${rawSlug}-${qualityTag}`;
}

// ─── Catálogo ─────────────────────────────────────────────────────────────────

function readCatalog() { return fs.readFileSync(CATALOG, "utf-8"); }
function writeCatalog(c) { fs.writeFileSync(CATALOG, c, "utf-8"); }

function readVars() {
  const c = readCatalog();
  return {
    GANANCIA_TELEFONO:  +(c.match(/GANANCIA_TELEFONO\s*=\s*(\d+)/)?.[1]   ?? 1000),
    GANANCIA_PIEZA:     +(c.match(/GANANCIA_PIEZA\s*=\s*(\d+)/)?.[1]      ?? 400),
    PRECIO_INSTALACION: +(c.match(/PRECIO_INSTALACION\s*=\s*(\d+)/)?.[1]  ?? 800),
    DELIVERY_DEFAULT:    (c.match(/DELIVERY_DEFAULT\s*=\s*"([^"]+)"/)?.[1] ?? "10-12 días hábiles"),
  };
}

function writeVars({ GANANCIA_TELEFONO, GANANCIA_PIEZA, PRECIO_INSTALACION, DELIVERY_DEFAULT }) {
  let c = readCatalog();
  if (GANANCIA_TELEFONO  != null) c = c.replace(/GANANCIA_TELEFONO\s*=\s*\d+/,      `GANANCIA_TELEFONO = ${GANANCIA_TELEFONO}`);
  if (GANANCIA_PIEZA     != null) c = c.replace(/GANANCIA_PIEZA\s*=\s*\d+/,         `GANANCIA_PIEZA = ${GANANCIA_PIEZA}`);
  if (PRECIO_INSTALACION != null) c = c.replace(/PRECIO_INSTALACION\s*=\s*\d+/,     `PRECIO_INSTALACION = ${PRECIO_INSTALACION}`);
  if (DELIVERY_DEFAULT   != null) c = c.replace(/DELIVERY_DEFAULT\s*=\s*"[^"]*"/,   `DELIVERY_DEFAULT = "${DELIVERY_DEFAULT}"`);
  writeCatalog(c);
}

function parseSalesCatalog() {
  const content = readCatalog();
  return [...content.matchAll(
    /\{\s*series:\s*"([^"]+)",\s*id:\s*"([^"]+)",\s*devices:\s*\[([\s\S]*?)\]\s*\}/g
  )].map(([, series, id, devicesRaw]) => ({
    series, id,
    devices: [...devicesRaw.matchAll(
      /\{[^{}]*name:\s*"([^"]+)"[^{}]*price:\s*(\d+)[^{}]*ganancia:\s*GANANCIA_TELEFONO[^{}]*availability:\s*"([^"]+)"[^{}]*color:\s*"([^"]+)"[^{}]*\}/g
    )].map(([, name, price, availability, color]) => ({
      name, price: +price, availability, color, slug: nameToSlug(name),
    }))
  }));
}

function parseRepairCatalog() {
  const content = readCatalog();
  return [...content.matchAll(
    /\{\s*series:\s*"([^"]+)",\s*id:\s*"[^"]+",\s*parts:\s*\[([\s\S]*?)\]\s*\}/g
  )].map(([, series, partsRaw]) => ({
    series,
    parts: [...partsRaw.matchAll(
      /\{[^{}]*name:\s*"([^"]+)"[^{}]*model:\s*"([^"]+)"[^{}]*pricePart:\s*(\d+)[^{}]*priceInstall:\s*(\d+)[^{}]*\}/g
    )].map(([, name, model, pricePart, priceInstall]) => ({ name, model, pricePart: +pricePart, priceInstall: +priceInstall, slug: partToSlug(name, model) }))
  }));
}

function parseFallbacks() {
  const c = readCatalog();
  const m = c.match(/deviceImageFallback[\s\S]*?\{([\s\S]*?)\}/);
  if (!m) return {};
  return Object.fromEntries([...m[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map(([, k, v]) => [k, v]));
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function updateDevice(oldName, newLine) {
  let c = readCatalog();
  const pat = new RegExp(`\\{[^{}]*name:\\s*"${escapeRe(oldName)}"[^{}]*\\}`);
  if (!pat.test(c)) return false;
  writeCatalog(c.replace(pat, newLine));
  return true;
}

function deleteDevice(name) {
  let c = readCatalog();
  const pat = new RegExp(`\\s*\\{[^{}]*name:\\s*"${escapeRe(name)}"[^{}]*\\},?`);
  if (!pat.test(c)) return false;
  writeCatalog(c.replace(pat, ''));
  return true;
}

function updatePart(oldName, oldModel, newLine) {
  let c = readCatalog();
  const pat = new RegExp(`\\{[^{}]*name:\\s*"${escapeRe(oldName)}"[^{}]*model:\\s*"${escapeRe(oldModel)}"[^{}]*\\}`);
  if (!pat.test(c)) return false;
  writeCatalog(c.replace(pat, newLine));
  return true;
}

function deletePart(name, model) {
  let c = readCatalog();
  const pat = new RegExp(`\\s*\\{[^{}]*name:\\s*"${escapeRe(name)}"[^{}]*model:\\s*"${escapeRe(model)}"[^{}]*\\},?`);
  if (!pat.test(c)) return false;
  writeCatalog(c.replace(pat, ''));
  return true;
}

function insertDevice(series, line) {
  const c = readCatalog();
  const pat = new RegExp(`(series: "${series}",[\\s\\S]*?devices: \\[[\\s\\S]*?)(\\s*\\]\\s*\\})`, "m");
  if (!pat.test(c)) return false;
  writeCatalog(c.replace(pat, `$1\n      ${line}$2`));
  return true;
}

function insertPart(series, line) {
  const c = readCatalog();
  const pat = new RegExp(`(series: "${series}",[\\s\\S]*?parts: \\[[\\s\\S]*?)(\\s*\\]\\s*\\})`, "m");
  if (!pat.test(c)) return false;
  writeCatalog(c.replace(pat, `$1\n      ${line}$2`));
  return true;
}

function upsertFallback(slug, fallback) {
  let c = readCatalog();
  if (c.includes(`"${slug}":`))
    c = c.replace(new RegExp(`"${slug}":\\s*"[^"]+"`), `"${slug}": "${fallback}"`);
  else
    c = c.replace(/(deviceImageFallback[\s\S]*?\{)([\s\S]*?)(\};)/, `$1$2  "${slug}": "${fallback}",\n$3`);
  writeCatalog(c);
}

function listImages() {
  return fs.readdirSync(IMAGES_DIR).filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f)).sort();
}

function addSeries(name, id, types) {
  let c = readCatalog();
  if (types.includes("equipo")) {
    const block = `  {\n    series: "${name}",\n    id: "${id}",\n    devices: []\n  }`;
    c = c.replace(/(export const salesCatalog\s*=\s*\[[\s\S]*?)\];/, `$1,\n${block}\n];`);
  }
  if (types.includes("refaccion")) {
    const block = `  {\n    series: "${name}",\n    id: "${id}",\n    parts: []\n  }`;
    c = c.replace(/(export const repairCatalog\s*=\s*\[[\s\S]*?)\];/, `$1,\n${block}\n];`);
  }
  writeCatalog(c);
}

// ─── API ──────────────────────────────────────────────────────────────────────

app.get("/api/catalog", (req, res) => {
  const devices = parseSalesCatalog();
  res.json({
    vars: readVars(),
    devices,
    parts: parseRepairCatalog(),
    fallbacks: parseFallbacks(),
    images: listImages(),
    deviceSlugs: devices.flatMap(s => s.devices.map(d => ({ slug: d.slug, name: d.name }))),
  });
});

app.post("/api/vars", (req, res) => {
  writeVars(req.body);
  res.json({ ok: true });
});

app.post("/api/series", (req, res) => {
  const { name, id, types } = req.body;
  if (!name || !id || !types?.length) return res.status(400).json({ error: "Faltan campos" });
  addSeries(name, id, types);
  res.json({ ok: true });
});

app.post("/api/device", (req, res) => {
  const { series, name, price, availability, color } = req.body;
  if (!series || !name || !price) return res.status(400).json({ error: "Faltan campos" });
  const line = `{ name: "${name}", specs: "128GB", price: ${price}, ganancia: GANANCIA_TELEFONO, availability: "${availability || "Importación 10-12 días hábiles"}", color: "${color || ""}" },`;
  if (!insertDevice(series, line)) return res.status(404).json({ error: `Serie "${series}" no encontrada` });
  res.json({ ok: true, slug: nameToSlug(name) });
});

app.post("/api/part", (req, res) => {
  const { series, name, model, pricePart, priceInstall, delivery } = req.body;
  if (!series || !name || !model || !pricePart) return res.status(400).json({ error: "Faltan campos" });
  const line = `{ name: "${name}", model: "${model}", pricePart: ${pricePart}, priceInstall: ${priceInstall || 800}, ganancia: GANANCIA_PIEZA, delivery: "${delivery || "10-12 días hábiles"}" },`;
  if (!insertPart(series, line)) return res.status(404).json({ error: `Serie "${series}" no encontrada` });
  res.json({ ok: true });
});

app.put("/api/device", (req, res) => {
  const { oldName, name, price, availability, color } = req.body;
  if (!oldName || !name || !price) return res.status(400).json({ error: "Faltan campos" });
  const line = `{ name: "${name}", specs: "128GB", price: ${price}, ganancia: GANANCIA_TELEFONO, availability: "${availability}", color: "${color}" }`;
  if (!updateDevice(oldName, line)) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true, slug: nameToSlug(name) });
});

app.delete("/api/device", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Falta nombre" });
  if (!deleteDevice(name)) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true });
});

app.put("/api/part", (req, res) => {
  const { oldName, oldModel, name, model, pricePart, priceInstall, delivery } = req.body;
  if (!oldName || !name || !model || !pricePart) return res.status(400).json({ error: "Faltan campos" });
  const line = `{ name: "${name}", model: "${model}", pricePart: ${pricePart}, priceInstall: ${priceInstall || 800}, ganancia: GANANCIA_PIEZA, delivery: "${delivery}" }`;
  if (!updatePart(oldName, oldModel, line)) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true });
});

app.delete("/api/part", (req, res) => {
  const { name, model } = req.body;
  if (!name || !model) return res.status(400).json({ error: "Faltan campos" });
  if (!deletePart(name, model)) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true });
});

app.post("/api/fallback", (req, res) => {
  const { slug, fallback } = req.body;
  if (!slug || !fallback) return res.status(400).json({ error: "Faltan campos" });
  upsertFallback(slug, fallback);
  res.json({ ok: true });
});

app.post("/api/image", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Sin archivo" });
  const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
  const name = req.body.slug ? `${req.body.slug}${ext}` : req.file.originalname.toLowerCase().replace(/\s+/g, "-");
  const target = path.join(IMAGES_DIR, name);
  fs.renameSync(req.file.path, target);
  res.json({ ok: true, filename: name });
});

app.delete("/api/image/:name", (req, res) => {
  const t = path.join(IMAGES_DIR, path.basename(req.params.name));
  if (fs.existsSync(t)) fs.unlinkSync(t);
  res.json({ ok: true });
});

app.get("/images/productos/:file", (req, res) => {
  res.sendFile(path.join(IMAGES_DIR, path.basename(req.params.file)));
});

app.get("/", (req, res) => res.send(HTML));

const PORT = 3333;
app.listen(PORT, () => console.log(`\n  ✓ Admin → http://localhost:${PORT}\n`));

// ─── HTML ─────────────────────────────────────────────────────────────────────

const HTML = /* html */`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pixel Fix — Admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--ink:#0f0f0f;--muted:#6b7280;--border:#e5e7eb;--surface:#f9fafb;--accent:#2563eb;--success:#16a34a;--danger:#dc2626;--warn:#d97706;--radius:10px}
body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--surface);color:var(--ink)}
header{background:white;border-bottom:1px solid var(--border);padding:0 24px;display:flex;align-items:center;gap:12px;height:52px;position:sticky;top:0;z-index:10}
header h1{font-size:15px;font-weight:600}
.tabs{display:flex;gap:2px;border-bottom:1px solid var(--border);background:white;padding:0 24px}
.tab{padding:10px 18px;font-size:13px;font-weight:500;border:none;background:none;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;transition:all .15s}
.tab.active{color:var(--ink);border-bottom-color:var(--ink)}
.panel{display:none;padding:24px;max-width:1140px;margin:0 auto}
.panel.active{display:block}
.card{background:white;border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:14px}
.card-title{font-size:13px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.grid-4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px}
label{display:block;font-size:11px;font-weight:600;color:var(--muted);margin-bottom:3px;text-transform:uppercase;letter-spacing:.04em}
input,select{width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px;color:var(--ink);background:white;outline:none;transition:border .15s}
input:focus,select:focus{border-color:var(--accent)}
.field{display:flex;flex-direction:column;gap:2px}
.hint{font-size:11px;color:var(--muted);font-family:monospace;margin-top:3px}
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 16px;border-radius:6px;font-size:13px;font-weight:500;border:none;cursor:pointer;transition:opacity .15s;white-space:nowrap}
.btn-primary{background:var(--ink);color:white}
.btn-primary:hover{opacity:.85}
.btn-sm{padding:4px 10px;font-size:11px;border-radius:5px}
.btn-danger{background:var(--danger);color:white}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--ink)}
.btn-ghost:hover{background:var(--surface)}
.btn-upload{background:#eff6ff;border:1px solid #bfdbfe;color:var(--accent);padding:4px 10px;font-size:11px;border-radius:5px;cursor:pointer;display:inline-flex;align-items:center;gap:4px}
.btn-upload:hover{background:#dbeafe}
.btn-disabled{opacity:.4;cursor:not-allowed;pointer-events:none}
.table{width:100%;border-collapse:collapse;font-size:13px}
.table th{text-align:left;padding:7px 10px;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--border);white-space:nowrap}
.table td{padding:9px 10px;border-bottom:1px solid var(--border);vertical-align:middle}
.table tr:last-child td{border-bottom:none}
.slug-col{font-family:monospace;font-size:10px;color:var(--muted)}
.has-img{display:inline-flex;align-items:center;gap:5px}
.has-img img{width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid var(--border)}
.no-img-dot{width:8px;height:8px;border-radius:50%;background:var(--border);display:inline-block}
.series-sep{background:var(--surface);border-bottom:1px solid var(--border)}
.series-sep td{padding:6px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.vars-bar{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap}
.vars-bar .field{min-width:140px}
.toast{position:fixed;bottom:20px;right:20px;padding:10px 18px;border-radius:var(--radius);font-size:13px;font-weight:500;color:white;z-index:100;opacity:0;transition:opacity .3s;pointer-events:none}
.toast.show{opacity:1}
.toast.ok{background:var(--success)}
.toast.err{background:var(--danger)}
.btn-lightning{background:#fef9c3;border:1px solid #fde047;color:#854d0e;padding:4px 10px;font-size:11px;border-radius:5px;cursor:pointer;display:inline-flex;align-items:center;gap:3px}
.btn-lightning:hover{background:#fef08a}
.btn-lightning.active{background:#fde047;border-color:#ca8a04}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;display:flex;align-items:center;justify-content:center}
.modal{background:white;border-radius:var(--radius);padding:24px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.18)}
.modal h3{font-size:14px;font-weight:600;margin-bottom:4px}
.modal .subtitle{font-size:12px;color:var(--muted);margin-bottom:16px}
.radio-group{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.radio-group label{font-size:13px;font-weight:400;text-transform:none;letter-spacing:0;display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--ink)}
.radio-group input[type=radio]{width:auto;padding:0}
.series-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.series-chip{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:3px 10px;font-size:11px;font-family:monospace;color:var(--ink)}
.series-chip.equipo{border-color:#bfdbfe;background:#eff6ff;color:#1d4ed8}
.series-chip.refaccion{border-color:#d1fae5;background:#ecfdf5;color:#065f46}
.series-chip.both{border-color:#e9d5ff;background:#faf5ff;color:#6b21a8}
.img-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:10px}
.img-card{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:white}
.img-card img{width:100%;height:90px;object-fit:cover}
.img-card .img-name{font-size:9px;font-family:monospace;padding:5px 7px;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:3px;word-break:break-all}
.tag{display:inline-block;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:600}
.tag-open{background:#dbeafe;color:#1d4ed8}
.tag-usado{background:#f3f4f6;color:#374151}
.tag-nuevo{background:#dcfce7;color:#15803d}
@media(max-width:640px){.grid-2,.grid-3,.grid-4{grid-template-columns:1fr}.vars-bar{flex-direction:column}}
</style>
</head>
<body>

<header>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
  <h1>Pixel Fix Admin</h1>
</header>

<div class="tabs">
  <button class="tab active" onclick="switchTab('devices')">Equipos</button>
  <button class="tab" onclick="switchTab('parts')">Piezas</button>
  <button class="tab" onclick="switchTab('images')">Imágenes</button>
</div>

<!-- ════════ EQUIPOS ════════ -->
<div id="tab-devices" class="panel active">

  <!-- Variables globales -->
  <div class="card">
    <div class="card-title">Variables globales</div>
    <div class="vars-bar">
      <div class="field">
        <label>Ganancia por teléfono</label>
        <input id="v-gantel" type="number" step="100">
      </div>
      <div class="field">
        <label>Ganancia por pieza</label>
        <input id="v-ganpieza" type="number" step="100">
      </div>
      <div class="field">
        <label>Precio instalación default</label>
        <input id="v-install" type="number" step="50">
      </div>
      <div class="field">
        <label>Tiempo entrega default</label>
        <input id="v-delivery" type="text" placeholder="10-12 días hábiles">
      </div>
      <div style="display:flex;gap:8px;padding-bottom:1px">
        <button class="btn btn-primary" onclick="saveVars()">Guardar</button>
        <button class="btn btn-ghost btn-disabled" title="Próximamente">⚡ Entrega inmediata</button>
      </div>
    </div>
  </div>

  <!-- Series -->
  <div class="card">
    <div class="card-title" style="justify-content:space-between">
      Series configuradas
      <button class="btn btn-sm btn-ghost" onclick="openSeriesModal()">+ Agregar serie</button>
    </div>
    <div id="series-summary"></div>
  </div>

  <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
    <button class="btn btn-primary" onclick="openDeviceModal()">+ Agregar equipo</button>
  </div>

  <!-- Tabla de equipos -->
  <div class="card" style="padding:0;overflow:hidden">
    <div id="devices-list"></div>
  </div>
</div>

<!-- ════════ PIEZAS ════════ -->
<div id="tab-parts" class="panel">

  <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
    <button class="btn btn-primary" onclick="openPartModal()">+ Agregar pieza</button>
  </div>

  <!-- Tabla de piezas -->
  <div class="card" style="padding:0;overflow:hidden">
    <div id="parts-list"></div>
  </div>
</div>

<!-- ════════ IMÁGENES ════════ -->
<div id="tab-images" class="panel">
  <div class="card">
    <div class="card-title">Imágenes subidas</div>
    <div id="images-grid" class="img-grid"></div>
    <p id="no-images" style="color:var(--muted);font-size:13px;display:none">Sin imágenes todavía.</p>
  </div>
  <div class="card">
    <div class="card-title">Fallbacks</div>
    <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Si un equipo no tiene imagen propia, usa la de otro slug.</p>
    <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">
      <div class="field" style="flex:1;min-width:200px">
        <label>Equipo sin imagen</label>
        <select id="img-fallback-from"><option value="">—</option></select>
      </div>
      <span style="padding:22px 4px 7px;color:var(--muted)">→</span>
      <div class="field" style="flex:1;min-width:200px">
        <label>Usa la imagen de</label>
        <select id="img-fallback-to"><option value="">—</option></select>
      </div>
      <button class="btn btn-primary" onclick="saveFallback()">Guardar</button>
    </div>
    <div id="fallbacks-list" style="margin-top:14px"></div>
  </div>
</div>

<!-- ════ MODAL EQUIPO ════ -->
<div id="device-modal" class="modal-overlay" style="display:none" onclick="if(event.target===this)closeDeviceModal()">
  <div class="modal" style="width:min(640px,95vw)">
    <h3 id="d-modal-title">Agregar equipo</h3>
    <input type="hidden" id="d-old-name">
    <div style="margin-bottom:10px">
      <div class="field">
        <label>Serie</label>
        <select id="d-series"></select>
      </div>
      <div class="field">
        <label>Nombre completo</label>
        <input id="d-name" type="text" placeholder="Google Pixel 10 Pro" oninput="previewSlug()">
        <div class="hint" id="d-slug-hint" style="display:none"></div>
      </div>
      <div class="field">
        <label>Precio base (sin ganancia)</label>
        <input id="d-price" type="number" placeholder="13500">
      </div>
    </div>
    <div style="margin-bottom:14px">
      <div class="field">
        <label>Colores</label>
        <input id="d-color" type="text" placeholder="Obsidian / Hazel">
      </div>
      <div class="field" style="grid-column:span 2">
        <label>Disponibilidad</label>
        <input id="d-avail" type="text" value="Importación 10-12 días hábiles">
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" id="d-submit-btn" onclick="submitDevice()">Agregar equipo</button>
      <button class="btn btn-ghost" onclick="closeDeviceModal()">Cancelar</button>
    </div>
  </div>
</div>

<!-- ════ MODAL PIEZA ════ -->
<div id="part-modal" class="modal-overlay" style="display:none" onclick="if(event.target===this)closePartModal()">
  <div class="modal" style="width:min(640px,95vw)">
    <h3 id="p-modal-title">Agregar pieza</h3>
    <input type="hidden" id="p-old-name">
    <input type="hidden" id="p-old-model">
    <div class="grid-3" style="margin-bottom:10px">
      <div class="field">
        <label>Serie</label>
        <select id="p-series"></select>
      </div>
      <div class="field">
        <label>Tipo</label>
        <select id="p-type">
          <option value="Pantalla OLED con Huella (Réplica Excelente)">Pantalla — Réplica Excelente</option>
          <option value="Pantalla OLED Original Nueva">Pantalla — Original Nueva</option>
          <option value="Pantalla OLED Original Reacondicionada">Pantalla — Original Reacond.</option>
          <option value="Pila Nueva Original">Batería — Original</option>
        </select>
      </div>
      <div class="field">
        <label>Modelo(s)</label>
        <input id="p-model" type="text" placeholder="Pixel 9 Pro / 9a">
      </div>
    </div>
    <div class="grid-3" style="margin-bottom:14px">
      <div class="field">
        <label>Precio pieza</label>
        <input id="p-price" type="number" placeholder="3500">
      </div>
      <div class="field">
        <label>Precio instalación MTY</label>
        <input id="p-install" type="number" value="800">
      </div>
      <div class="field">
        <label>Tiempo de entrega</label>
        <input id="p-delivery" type="text" value="10-12 días hábiles">
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" id="p-submit-btn" onclick="submitPart()">Agregar pieza</button>
      <button class="btn btn-ghost" onclick="closePartModal()">Cancelar</button>
    </div>
  </div>
</div>

<!-- ════ MODAL ENTREGA INMEDIATA ════ -->
<div id="delivery-modal" class="modal-overlay" style="display:none" onclick="if(event.target===this)closeDeliveryModal()">
  <div class="modal">
    <h3>⚡ Entrega inmediata</h3>
    <p class="subtitle" id="modal-device-name"></p>
    <div class="radio-group">
      <label><input type="radio" name="dm" value="import" onchange="onDeliveryModeChange()"> Importación — 10-12 días hábiles</label>
      <label><input type="radio" name="dm" value="stock"  onchange="onDeliveryModeChange()"> En stock · Entrega inmediata MTY</label>
      <label><input type="radio" name="dm" value="custom" onchange="onDeliveryModeChange()"> Texto personalizado…</label>
    </div>
    <input id="modal-custom-text" type="text" placeholder="Ej: 2-3 días hábiles" style="display:none;margin-bottom:12px">
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn btn-primary" onclick="saveDeliveryModal()">Guardar</button>
      <button class="btn btn-ghost" onclick="closeDeliveryModal()">Cancelar</button>
    </div>
  </div>
</div>

<!-- ════ MODAL AGREGAR SERIE ════ -->
<div id="series-modal" class="modal-overlay" style="display:none" onclick="if(event.target===this)closeSeriesModal()">
  <div class="modal">
    <h3>Agregar serie</h3>
    <p class="subtitle">Agrega un bloque vacío al catálogo. Después agrega equipos o piezas desde los formularios.</p>
    <div class="grid-2" style="margin-bottom:12px">
      <div class="field">
        <label>Nombre</label>
        <input id="s-name" type="text" placeholder="Pixel 11 Series" oninput="previewSeriesId()">
      </div>
      <div class="field">
        <label>ID (slug)</label>
        <input id="s-id" type="text" placeholder="pixel-11">
      </div>
    </div>
    <div class="field" style="margin-bottom:16px">
      <label>Tipo</label>
      <div style="display:flex;gap:12px;margin-top:4px">
        <label style="font-size:13px;font-weight:400;text-transform:none;letter-spacing:0;display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="s-equipo" checked style="width:auto;padding:0"> Equipos</label>
        <label style="font-size:13px;font-weight:400;text-transform:none;letter-spacing:0;display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="s-refaccion" checked style="width:auto;padding:0"> Piezas</label>
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" onclick="saveSeries()">Crear serie</button>
      <button class="btn btn-ghost" onclick="closeSeriesModal()">Cancelar</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
let data = { vars:{}, devices:[], parts:[], fallbacks:{}, images:[], deviceSlugs:[] };

function nameToSlug(name) {
  const model = name.replace(/^Google\\s+/, "");
  return "equipo-" + model.toLowerCase().replace(/\\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function load() {
  data = await fetch('/api/catalog').then(r => r.json());
  fillVars();
  populateSeries();
  renderDevices();
  renderParts();
  renderImages();
  renderFallbacks();
  renderSeriesSummary();
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((t,i) => t.classList.toggle('active', ['devices','parts','images'][i]===tab));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
}

function toast(msg, type='ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show '+type;
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── Vars ─────────────────────────────────────────────────────────────────────

function fillVars() {
  document.getElementById('v-gantel').value   = data.vars.GANANCIA_TELEFONO  ?? '';
  document.getElementById('v-ganpieza').value = data.vars.GANANCIA_PIEZA     ?? '';
  document.getElementById('v-install').value  = data.vars.PRECIO_INSTALACION ?? '';
  document.getElementById('v-delivery').value = data.vars.DELIVERY_DEFAULT   ?? '';
  // Sincronizar defaults en formulario de piezas
  if (!document.getElementById('p-old-name').value) {
    document.getElementById('p-install').value  = data.vars.PRECIO_INSTALACION ?? 800;
    document.getElementById('p-delivery').value = data.vars.DELIVERY_DEFAULT   ?? '10-12 días hábiles';
  }
}

async function saveVars() {
  const body = {
    GANANCIA_TELEFONO:  +document.getElementById('v-gantel').value,
    GANANCIA_PIEZA:     +document.getElementById('v-ganpieza').value,
    PRECIO_INSTALACION: +document.getElementById('v-install').value,
    DELIVERY_DEFAULT:    document.getElementById('v-delivery').value.trim(),
  };
  await fetch('/api/vars', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
  toast('Variables guardadas ✓');
  await load();
}

// ─── Series selects ──────────────────────────────────────────────────────────

function populateSeries() {
  const dSel = document.getElementById('d-series');
  const pSel = document.getElementById('p-series');
  const prev_d = dSel.value;
  const prev_p = pSel.value;

  dSel.innerHTML = data.devices.map(s => \`<option>\${s.series}</option>\`).join('');
  pSel.innerHTML = data.parts.map(s => \`<option>\${s.series}</option>\`).join('');

  if (prev_d) dSel.value = prev_d;
  if (prev_p) pSel.value = prev_p;

  // fallback selects
  const opts = '<option value="">—</option>' + data.deviceSlugs.map(d => \`<option value="\${d.slug}">\${d.name}</option>\`).join('');
  document.getElementById('img-fallback-from').innerHTML = opts;
  document.getElementById('img-fallback-to').innerHTML   = opts;
}

// ─── Devices ──────────────────────────────────────────────────────────────────

function previewSlug() {
  const name = document.getElementById('d-name').value.trim();
  const hint = document.getElementById('d-slug-hint');
  if (!name) { hint.style.display='none'; return; }
  hint.textContent = "→ " + nameToSlug(name) + ".webp";
  hint.style.display = '';
}

function renderDevices() {
  const el = document.getElementById('devices-list');
  if (!data.devices.length) { el.innerHTML = '<p style="padding:20px;color:var(--muted)">Sin equipos</p>'; return; }
  const imageSet = new Map();
  data.images.forEach(f => imageSet.set(f.replace(/\\.[^.]+$/, ""), f));

  let rows = '';
  for (const s of data.devices) {
    rows += \`<tr class="series-sep"><td colspan="8">\${s.series}</td></tr>\`;
    for (const d of s.devices) {
      const imgFile = imageSet.get(d.slug);
      const imgCell = imgFile
        ? \`<span class="has-img"><img src="/images/productos/\${imgFile}" alt=""></span>\`
        : \`<span class="no-img-dot"></span>\`;
      const salePrice = d.price + (data.vars.GANANCIA_TELEFONO ?? 1000);
      rows += \`<tr>
        <td>\${d.name}</td>
        <td style="font-family:monospace">$\${d.price.toLocaleString('es-MX')}</td>
        <td style="font-family:monospace;font-weight:600;color:var(--ink)">$\${salePrice.toLocaleString('es-MX')}</td>
        <td style="color:var(--muted);font-size:12px">\${d.color}</td>
        <td class="slug-col">\${d.slug}</td>
        <td>\${imgCell}</td>
        <td>
          <label class="btn-upload" title="\${d.slug}">
            <input type="file" accept="image/*" style="display:none" data-slug="\${d.slug}" onchange="uploadInline(this)">
            \${imgFile ? '↑ Cambiar' : '↑ Subir'}
          </label>
        </td>
        <td style="white-space:nowrap">
          <button class="btn-lightning \${d.availability.includes('inmediata') ? 'active' : ''}" data-d="\${encodeURIComponent(JSON.stringify(d))}" onclick="openDeliveryModal(this)" title="Entrega inmediata">⚡</button>
          <button class="btn btn-sm btn-ghost" style="margin-left:4px" data-d="\${encodeURIComponent(JSON.stringify(d))}" onclick="editDeviceFromBtn(this)">Editar</button>
          <button class="btn btn-sm btn-danger" style="margin-left:4px" data-name="\${encodeURIComponent(d.name)}" onclick="deleteDeviceFromBtn(this)">✕</button>
        </td>
      </tr>\`;
    }
  }

  el.innerHTML = \`<table class="table">
    <thead><tr><th>Nombre</th><th>Costo</th><th>Venta</th><th>Colores</th><th>Slug</th><th>Img</th><th></th><th></th></tr></thead>
    <tbody>\${rows}</tbody>
  </table>\`;
}

function openDeviceModal(d) {
  if (d) {
    document.getElementById('d-old-name').value = d.name;
    document.getElementById('d-name').value     = d.name;
    document.getElementById('d-price').value    = d.price;
    document.getElementById('d-color').value    = d.color;
    document.getElementById('d-avail').value    = d.availability;
    document.getElementById('d-modal-title').textContent = 'Editar equipo';
    document.getElementById('d-submit-btn').textContent  = 'Guardar cambios';
    previewSlug();
  } else {
    document.getElementById('d-old-name').value = '';
    document.getElementById('d-name').value     = '';
    document.getElementById('d-price').value    = '';
    document.getElementById('d-color').value    = '';
    document.getElementById('d-avail').value    = 'Importación 10-12 días hábiles';
    document.getElementById('d-modal-title').textContent = 'Agregar equipo';
    document.getElementById('d-submit-btn').textContent  = 'Agregar equipo';
    document.getElementById('d-slug-hint').style.display = 'none';
  }
  document.getElementById('device-modal').style.display = 'flex';
}

function closeDeviceModal() {
  document.getElementById('device-modal').style.display = 'none';
}

function editDevice(d) { openDeviceModal(d); }

async function submitDevice() {
  const oldName = document.getElementById('d-old-name').value;
  const body = {
    series: document.getElementById('d-series').value,
    name:   document.getElementById('d-name').value.trim(),
    price:  +document.getElementById('d-price').value,
    color:  document.getElementById('d-color').value.trim(),
    availability: document.getElementById('d-avail').value.trim(),
  };
  if (!body.name || !body.price) return toast('Completa nombre y precio', 'err');

  if (oldName) {
    body.oldName = oldName;
    const r = await fetch('/api/device', { method:'PUT', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) return toast(j.error, 'err');
    toast(\`"\${body.name}" actualizado ✓\`);
  } else {
    const r = await fetch('/api/device', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) return toast(j.error, 'err');
    toast(\`"\${body.name}" agregado — slug: \${j.slug}\`);
  }
  closeDeviceModal();
  await load();
}

async function deleteDeviceRow(name) {
  if (!confirm(\`¿Eliminar "\${name}"?\`)) return;
  const r = await fetch('/api/device', { method:'DELETE', headers:{'content-type':'application/json'}, body: JSON.stringify({ name }) });
  const j = await r.json();
  if (!r.ok) return toast(j.error, 'err');
  toast(\`"\${name}" eliminado\`);
  await load();
}

// ─── Parts ────────────────────────────────────────────────────────────────────

function renderParts() {
  const el = document.getElementById('parts-list');
  if (!data.parts.length) { el.innerHTML = '<p style="padding:20px;color:var(--muted)">Sin piezas</p>'; return; }
  const imageSet = new Map();
  data.images.forEach(f => imageSet.set(f.replace(/\\.[^.]+$/, ""), f));
  let rows = '';
  for (const s of data.parts) {
    rows += \`<tr class="series-sep"><td colspan="7">\${s.series}</td></tr>\`;
    for (const p of s.parts) {
      const imgFile = imageSet.get(p.slug);
      const imgCell = imgFile
        ? \`<span class="has-img"><img src="/images/productos/\${imgFile}" alt=""></span>\`
        : \`<span class="no-img-dot"></span>\`;
      const salePrice = p.pricePart + (data.vars.GANANCIA_PIEZA ?? 400);
      rows += \`<tr>
        <td style="font-size:12px">\${p.name}</td>
        <td style="font-family:monospace;font-size:12px">\${p.model}</td>
        <td style="font-family:monospace">$\${p.pricePart.toLocaleString('es-MX')}</td>
        <td style="font-family:monospace;font-weight:600;color:var(--ink)">$\${salePrice.toLocaleString('es-MX')}</td>
        <td style="font-family:monospace">$\${p.priceInstall.toLocaleString('es-MX')}</td>
        <td class="slug-col">\${p.slug}</td>
        <td>\${imgCell}
          <label class="btn-upload" style="margin-left:6px" title="\${p.slug}">
            <input type="file" accept="image/*" style="display:none" data-slug="\${p.slug}" onchange="uploadInline(this)">
            \${imgFile ? '↑ Cambiar' : '↑ Subir'}
          </label>
        </td>
        <td style="white-space:nowrap">
          <button class="btn btn-sm btn-ghost" data-p="\${encodeURIComponent(JSON.stringify(p))}" onclick="editPartFromBtn(this)">Editar</button>
          <button class="btn btn-sm btn-danger" style="margin-left:4px" data-name="\${encodeURIComponent(p.name)}" data-model="\${encodeURIComponent(p.model)}" onclick="deletePartFromBtn(this)">✕</button>
        </td>
      </tr>\`;
    }
  }
  el.innerHTML = \`<table class="table">
    <thead><tr><th>Pieza</th><th>Modelo</th><th>Costo</th><th>Venta</th><th>Instalación</th><th>Slug</th><th>Img</th><th></th></tr></thead>
    <tbody>\${rows}</tbody>
  </table>\`;
}

function openPartModal(p) {
  if (p) {
    document.getElementById('p-old-name').value  = p.name;
    document.getElementById('p-old-model').value = p.model;
    document.getElementById('p-type').value      = p.name;
    document.getElementById('p-model').value     = p.model;
    document.getElementById('p-price').value     = p.pricePart;
    document.getElementById('p-install').value   = p.priceInstall;
    document.getElementById('p-modal-title').textContent = 'Editar pieza';
    document.getElementById('p-submit-btn').textContent  = 'Guardar cambios';
  } else {
    ['p-old-name','p-old-model','p-model','p-price'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('p-install').value   = data.vars.PRECIO_INSTALACION ?? 800;
    document.getElementById('p-delivery').value  = data.vars.DELIVERY_DEFAULT   ?? '10-12 días hábiles';
    document.getElementById('p-modal-title').textContent = 'Agregar pieza';
    document.getElementById('p-submit-btn').textContent  = 'Agregar pieza';
  }
  document.getElementById('part-modal').style.display = 'flex';
}

function closePartModal() {
  document.getElementById('part-modal').style.display = 'none';
}

function editPart(p) { openPartModal(p); }

async function submitPart() {
  const oldName  = document.getElementById('p-old-name').value;
  const oldModel = document.getElementById('p-old-model').value;
  const body = {
    series:       document.getElementById('p-series').value,
    name:         document.getElementById('p-type').value,
    model:        document.getElementById('p-model').value.trim(),
    pricePart:    +document.getElementById('p-price').value,
    priceInstall: +document.getElementById('p-install').value,
    delivery:     document.getElementById('p-delivery').value.trim(),
  };
  if (!body.model || !body.pricePart) return toast('Completa modelo y precio', 'err');

  if (oldName) {
    body.oldName = oldName; body.oldModel = oldModel;
    const r = await fetch('/api/part', { method:'PUT', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) return toast(j.error, 'err');
    toast(\`"\${body.name}" actualizada ✓\`);
  } else {
    const r = await fetch('/api/part', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) return toast(j.error, 'err');
    toast(\`"\${body.name}" agregada ✓\`);
  }
  closePartModal();
  await load();
}

async function deletePartRow(name, model) {
  if (!confirm(\`¿Eliminar "\${name}" / \${model}?\`)) return;
  const r = await fetch('/api/part', { method:'DELETE', headers:{'content-type':'application/json'}, body: JSON.stringify({ name, model }) });
  const j = await r.json();
  if (!r.ok) return toast(j.error, 'err');
  toast('Pieza eliminada');
  await load();
}

// ─── Inline image upload ──────────────────────────────────────────────────────

async function uploadInline(input) {
  const file = input.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('slug', input.dataset.slug);
  const r = await fetch('/api/image', { method:'POST', body: fd });
  const j = await r.json();
  if (!r.ok) return toast(j.error, 'err');
  toast(\`"\${j.filename}" subida ✓\`);
  input.value = '';
  await load();
}

// ─── Images tab ───────────────────────────────────────────────────────────────

function renderImages() {
  const grid = document.getElementById('images-grid');
  const none = document.getElementById('no-images');
  if (!data.images.length) { grid.innerHTML = ''; none.style.display = ''; return; }
  none.style.display = 'none';
  grid.innerHTML = data.images.map(f => \`
    <div class="img-card">
      <img src="/images/productos/\${f}" alt="\${f}" loading="lazy">
      <div class="img-name">
        <span>\${f}</span>
        <button class="btn btn-sm btn-danger" onclick="deleteImage('\${f}')">✕</button>
      </div>
    </div>
  \`).join('');
}

async function deleteImage(name) {
  if (!confirm(\`¿Eliminar "\${name}"?\`)) return;
  await fetch('/api/image/'+encodeURIComponent(name), { method:'DELETE' });
  toast(\`"\${name}" eliminada\`);
  await load();
}

function renderFallbacks() {
  const el = document.getElementById('fallbacks-list');
  const entries = Object.entries(data.fallbacks);
  if (!entries.length) { el.innerHTML = '<p style="color:var(--muted);font-size:13px">Sin fallbacks.</p>'; return; }
  el.innerHTML = \`<table class="table">
    <thead><tr><th>Slug sin imagen</th><th>Usa la imagen de</th></tr></thead>
    <tbody>\${entries.map(([k,v]) => \`<tr>
      <td class="slug-col">\${k}</td><td class="slug-col" style="color:var(--accent)">\${v}</td>
    </tr>\`).join('')}</tbody>
  </table>\`;
}

async function saveFallback() {
  const from = document.getElementById('img-fallback-from').value;
  const to   = document.getElementById('img-fallback-to').value;
  if (!from || !to) return toast('Selecciona ambos', 'err');
  if (from === to)  return toast('No pueden ser el mismo', 'err');
  await fetch('/api/fallback', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({slug:from, fallback:to}) });
  toast('Fallback guardado ✓');
  await load();
}

function editDeviceFromBtn(btn) { editDevice(JSON.parse(decodeURIComponent(btn.dataset.d))); }
function deleteDeviceFromBtn(btn) { deleteDeviceRow(decodeURIComponent(btn.dataset.name)); }
function editPartFromBtn(btn) { editPart(JSON.parse(decodeURIComponent(btn.dataset.p))); }
function deletePartFromBtn(btn) { deletePartRow(decodeURIComponent(btn.dataset.name), decodeURIComponent(btn.dataset.model)); }

// ─── Modal entrega inmediata ──────────────────────────────────────────────────

let _modalDevice = null;

function openDeliveryModal(btn) {
  _modalDevice = JSON.parse(decodeURIComponent(btn.dataset.d));
  document.getElementById('modal-device-name').textContent = _modalDevice.name;
  const av = _modalDevice.availability;
  const isStock  = av.includes('inmediata');
  const isImport = av.includes('días hábiles') && !isStock;
  const mode = isStock ? 'stock' : isImport ? 'import' : 'custom';
  document.querySelector(\`input[name=dm][value=\${mode}]\`).checked = true;
  const custom = document.getElementById('modal-custom-text');
  custom.style.display = mode === 'custom' ? '' : 'none';
  custom.value = mode === 'custom' ? av : '';
  document.getElementById('delivery-modal').style.display = 'flex';
}

function closeDeliveryModal() {
  document.getElementById('delivery-modal').style.display = 'none';
  _modalDevice = null;
}

function onDeliveryModeChange() {
  const mode = document.querySelector('input[name=dm]:checked')?.value;
  document.getElementById('modal-custom-text').style.display = mode === 'custom' ? '' : 'none';
}

async function saveDeliveryModal() {
  if (!_modalDevice) return;
  const mode = document.querySelector('input[name=dm]:checked')?.value;
  const avMap = {
    import: 'Importación 10-12 días hábiles',
    stock:  'En stock · Entrega inmediata MTY',
    custom: document.getElementById('modal-custom-text').value.trim(),
  };
  const availability = avMap[mode];
  if (!availability) return toast('Escribe el texto de disponibilidad', 'err');
  const body = { oldName: _modalDevice.name, name: _modalDevice.name, price: _modalDevice.price, color: _modalDevice.color, availability };
  const r = await fetch('/api/device', { method:'PUT', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) return toast(j.error, 'err');
  toast(\`"\${_modalDevice.name}" actualizado ✓\`);
  closeDeliveryModal();
  await load();
}

// ─── Series ───────────────────────────────────────────────────────────────────

function renderSeriesSummary() {
  const el = document.getElementById('series-summary');
  if (!el) return;
  const equipoSeries   = new Set(data.devices.map(s => s.series));
  const refaccionSeries = new Set(data.parts.map(s => s.series));
  const allSeries = [...new Set([...equipoSeries, ...refaccionSeries])];
  el.innerHTML = '<div class="series-chips">' + allSeries.map(s => {
    const inE = equipoSeries.has(s);
    const inR = refaccionSeries.has(s);
    const cls = inE && inR ? 'both' : inE ? 'equipo' : 'refaccion';
    const label = inE && inR ? 'equipos + piezas' : inE ? 'equipos' : 'piezas';
    return \`<span class="series-chip \${cls}" title="\${label}">\${s}</span>\`;
  }).join('') + '</div>';
}

function openSeriesModal() {
  document.getElementById('s-name').value = '';
  document.getElementById('s-id').value   = '';
  document.getElementById('s-equipo').checked   = true;
  document.getElementById('s-refaccion').checked = true;
  document.getElementById('series-modal').style.display = 'flex';
}

function closeSeriesModal() { document.getElementById('series-modal').style.display = 'none'; }

function previewSeriesId() {
  const name = document.getElementById('s-name').value;
  const id = name.toLowerCase().replace(/pixel\s*/i, 'pixel-').replace(/\s+series?$/i,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  document.getElementById('s-id').value = id;
}

async function saveSeries() {
  const name = document.getElementById('s-name').value.trim();
  const id   = document.getElementById('s-id').value.trim();
  const types = [];
  if (document.getElementById('s-equipo').checked)   types.push('equipo');
  if (document.getElementById('s-refaccion').checked) types.push('refaccion');
  if (!name || !id || !types.length) return toast('Completa todos los campos', 'err');
  const r = await fetch('/api/series', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ name, id, types }) });
  const j = await r.json();
  if (!r.ok) return toast(j.error, 'err');
  toast(\`Serie "\${name}" creada ✓\`);
  closeSeriesModal();
  await load();
}

load();
</script>
</body>
</html>`;
