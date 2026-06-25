// Centralized catalog data for Pixel Fix models, parts, and sales

export const formatPrice = (basePrice: number | string, profit: number = 0): string => {
  if (typeof basePrice === "string") return basePrice;
  if (basePrice === 0 || isNaN(basePrice)) return "$ Cotizar";
  const totalPrice = basePrice + profit;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(totalPrice) + " MXN";
};

export const repairCatalog = [
  {
    series: "Pixel 10 Series",
    id: "pixel-10",
    parts: [
      { name: "Pantalla OLED con Huella (Réplica Excelente)", model: "Pixel 10 Pro XL", pricePart: 4000, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pantalla OLED con Huella (Réplica Excelente)", model: "Pixel 10 Pro", pricePart: 3900, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pantalla OLED con Huella (Réplica Excelente)", model: "Pixel 10 / 10a", pricePart: 3800, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 10 Pro XL", pricePart: 2800, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 10 Pro", pricePart: 2700, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 10 / 10a", pricePart: 2500, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" }
    ]
  },
  {
    series: "Pixel 9 Series",
    id: "pixel-9",
    parts: [
      { name: "Pantalla OLED Original Nueva", model: "Pixel 9 Pro XL", pricePart: 5900, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pantalla OLED con Huella (Réplica Excelente)", model: "Pixel 9 Pro", pricePart: 3550, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pantalla OLED con Huella (Réplica Excelente)", model: "Pixel 9", pricePart: 3300, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pantalla OLED con Huella (Réplica Excelente)", model: "Pixel 9a", pricePart: 3000, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 9 Pro XL", pricePart: 2300, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 9 Pro", pricePart: 2100, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 9 / 9a", pricePart: 1900, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" }
    ]
  },
  {
    series: "Pixel 8 Series",
    id: "pixel-8",
    parts: [
      { name: "Pantalla OLED Original Reacondicionada", model: "Pixel 8 Pro", pricePart: 3800, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pantalla OLED Original Nueva", model: "Pixel 8 Pro", pricePart: 5400, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pantalla OLED con Huella (Réplica Excelente)", model: "Pixel 8", pricePart: 2500, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 8 Pro", pricePart: 1500, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 8a", pricePart: 1300, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 8", pricePart: 1200, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" }
    ]
  },
  {
    series: "Pixel 7 Series",
    id: "pixel-7",
    parts: [
      { name: "Pantalla Original", model: "Pixel 7 Pro", pricePart: 5400, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pantalla OLED con Huella (Réplica Excelente)", model: "Pixel 7 Pro", pricePart: 2850, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pantalla OLED con Huella (Réplica Excelente)", model: "Pixel 7 / 7a", pricePart: 2500, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 7 Pro", pricePart: 1000, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 7 / 7a", pricePart: 1000, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" }
    ]
  },
  {
    series: "Pixel 6 Series",
    id: "pixel-6",
    parts: [
      { name: "Pantalla OLED con Huella (Réplica Excelente)", model: "Pixel 6 / 6 Pro / 6a", pricePart: 2300, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" },
      { name: "Pila Nueva Original", model: "Pixel 6 / 6 Pro / 6a", pricePart: 1000, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" }
    ]
  },
  {
    series: "Pixel 5 Series",
    id: "pixel-5",
    parts: [
      { name: "Pila Nueva Original", model: "Pixel 5 / 5a", pricePart: 1000, priceInstall: 800, ganancia: 400, delivery: "10-12 días hábiles" }
    ]
  }
];

// ponytail: estructura unificada de catálogo para Store.astro (única fuente de la verdad)
export type StoreItem = {
  id: string;
  slug: string;
  type: "Pantalla" | "Batería" | "Equipo";
  iconType: "screen" | "battery" | "device";
  name: string;
  model: string;
  series: string;
  pricePart: number;
  priceInstall: number;
  delivery: string;
  specs?: string;
  category: "refaccion" | "equipo";
};

function splitModels(raw: string): string[] {
  if (!raw.includes("/")) return [raw.trim()];
  return raw.split("/").map((m) => {
    m = m.trim();
    return m.startsWith("Pixel") ? m : `Pixel ${m}`;
  });
}

export const MODEL_ORDER = [
  "Pixel 10 Pro XL", "Pixel 10 Pro", "Pixel 10", "Pixel 10a",
  "Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 9a",
  "Pixel 8 Pro", "Pixel 8", "Pixel 8a",
  "Pixel 7 Pro", "Pixel 7", "Pixel 7a",
  "Pixel 6 Pro", "Pixel 6", "Pixel 6a",
  "Pixel 5", "Pixel 5a",
];

export function getSeries(model: string): string {
  for (const n of [10, 9, 8, 7, 6, 5]) {
    if (model.includes(String(n))) return `Pixel ${n} Series`;
  }
  return "Otros";
}

export const salesCatalog = [
  {
    series: "Pixel 10 Series",
    id: "pixel-10",
    devices: [
      { name: "Google Pixel 10 Pro Fold", specs: "128GB - Open Box (Incluye Caja y Accesorios)", price: 16500, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Obsidian / Porcelain" },
      { name: "Google Pixel 10 Pro XL", specs: "128GB - Open Box (Incluye Caja y Accesorios)", price: 15000, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Obsidian / Porcelain" },
      { name: "Google Pixel 10 Pro", specs: "128GB - Open Box (Incluye Caja y Accesorios)", price: 13500, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Hazel" },
      { name: "Google Pixel 10", specs: "128GB - Open Box (Incluye Caja y Accesorios)", price: 11000, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Hazel" },
      { name: "Google Pixel 10a", specs: "128GB - Open Box (Incluye Caja y Accesorios)", price: 9700, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Obsidian" }
    ]
  },
  {
    series: "Pixel 9 Series",
    id: "pixel-9",
    devices: [
      { name: "Google Pixel 9 Pro Fold", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 14300, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Obsidian" },
      { name: "Google Pixel 9 Pro XL", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 11300, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Obsidian / Porcelain" },
      { name: "Google Pixel 9 Pro", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 10300, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Hazel" },
      { name: "Google Pixel 9", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 9300, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Wintergreen" },
      { name: "Google Pixel 9a", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 9000, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Obsidian" }
    ]
  },
  {
    series: "Pixel 8 Series",
    id: "pixel-8",
    devices: [
      { name: "Google Pixel 8 Pro", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 7400, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Bay Blue" },
      { name: "Google Pixel 8", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 7000, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Rose" },
      { name: "Google Pixel 8a", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 6700, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Obsidian" }
    ]
  },
  {
    series: "Pixel 7 Series",
    id: "pixel-7",
    devices: [
      { name: "Google Pixel 7 Pro", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 5800, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Hazel" },
      { name: "Google Pixel 7", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 5100, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Lemongrass" },
      { name: "Google Pixel 7a", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 4800, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Obsidian" }
    ]
  },
  {
    series: "Pixel 6 Series",
    id: "pixel-6",
    devices: [
      { name: "Google Pixel 6 Pro", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 5350, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Stormy Black" },
      { name: "Google Pixel 6", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 4500, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Sorta Seafoam" },
      { name: "Google Pixel 6a", specs: "128GB - Usado Estética 9 (Sin Caja)", price: 4400, ganancia: 400, availability: "Importación 10-12 días hábiles", color: "Charcoal" }
    ]
  }
];

const storeParts: StoreItem[] = repairCatalog.flatMap((series) =>
  series.parts.flatMap((p) => {
    const isBateria = p.name.toLowerCase().includes("pila");
    const isOriginal = p.name.toLowerCase().includes("original");
    const qualityTag = isOriginal ? "original" : "replica-excelente";
    const rawSlug = p.model.toLowerCase().replace(/\s*\/\s*/g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return splitModels(p.model).map((model) => ({
      id: `${series.id}-${model.toLowerCase().replace(/\s+/g, "-")}-${isBateria ? "bat" : "pan"}-${qualityTag}`,
      slug: `${isBateria ? "bateria" : "pantalla"}-${rawSlug}-${qualityTag}`,
      type: (isBateria ? "Batería" : "Pantalla") as StoreItem["type"],
      iconType: (isBateria ? "battery" : "screen") as StoreItem["iconType"],
      name: p.name,
      model,
      series: getSeries(model),
      pricePart: p.pricePart,
      priceInstall: p.priceInstall,
      delivery: p.delivery,
      category: "refaccion" as const,
    }));
  }),
);

const storeDevices: StoreItem[] = salesCatalog.flatMap((series) =>
  series.devices.map((d) => {
    const model = d.name.replace(/^Google\s+/, "");
    return {
      id: `${series.id}-${model.toLowerCase().replace(/\s+/g, "-")}-equipo`,
      slug: "",
      type: "Equipo" as const,
      iconType: "device" as const,
      name: d.name,
      model,
      series: getSeries(model),
      pricePart: d.price,
      priceInstall: 0,
      delivery: d.availability,
      specs: d.specs,
      category: "equipo" as const,
    };
  }),
);

export const storeCatalog: StoreItem[] = [...storeParts, ...storeDevices];

export const storeAvailableModels = MODEL_ORDER.filter((m) =>
  storeCatalog.some((i) => i.model === m),
);

export const storeAvailableSeries = ["10", "9", "8", "7", "6", "5"]
  .map((n) => `Pixel ${n} Series`)
  .filter((s) => storeCatalog.some((item) => item.series === s));