// Centralized catalog data for Pixel Fix models, parts, and sales

export const repairCatalog = [
  {
    series: "Pixel 10 Series",
    id: "pixel-10",
    parts: [
      { name: "Pantalla Original / OEM", model: "Pixel 10 / 10 Pro", pricePart: "$ Cotizar", priceInstall: "$ Cotizar", delivery: "10-12 días hábiles" },
      { name: "Batería Nueva Original", model: "Pixel 10 / 10 Pro", pricePart: "$ Cotizar", priceInstall: "$ Cotizar", delivery: "10-12 días hábiles" },
      { name: "Carcasa Trasera", model: "Pixel 10 / 10 Pro", pricePart: "$ Cotizar", priceInstall: "$ Cotizar", delivery: "10-12 días hábiles" }
    ]
  },
  {
    series: "Pixel 9 Series",
    id: "pixel-9",
    parts: [
      { name: "Pantalla Original / OEM", model: "Pixel 9 / 9 Pro", pricePart: "$ Cotizar", priceInstall: "$ Cotizar", delivery: "10-12 días hábiles" },
      { name: "Batería Nueva Original", model: "Pixel 9 / 9 Pro", pricePart: "$ Cotizar", priceInstall: "$ Cotizar", delivery: "10-12 días hábiles" },
      { name: "Carcasa Trasera", model: "Pixel 9 / 9 Pro", pricePart: "$ Cotizar", priceInstall: "$ Cotizar", delivery: "10-12 días hábiles" }
    ]
  },
  {
    series: "Pixel 8 Series",
    id: "pixel-8",
    parts: [
      { name: "Pantalla Original / OEM", model: "Pixel 8 / 8 Pro", pricePart: "$4,800 MXN", priceInstall: "$5,400 MXN", delivery: "10-12 días hábiles" },
      { name: "Batería Nueva Original", model: "Pixel 8 / 8 Pro", pricePart: "$1,400 MXN", priceInstall: "$1,900 MXN", delivery: "10-12 días hábiles" },
      { name: "Carcasa Trasera", model: "Pixel 8 / 8 Pro", pricePart: "$2,500 MXN", priceInstall: "$3,000 MXN", delivery: "10-12 días hábiles" }
    ]
  },
  {
    series: "Pixel 7 Series",
    id: "pixel-7",
    parts: [
      { name: "Pantalla Original / OEM", model: "Pixel 7 / 7 Pro", pricePart: "$4,000 MXN", priceInstall: "$4,600 MXN", delivery: "10-12 días hábiles" },
      { name: "Batería Nueva Original", model: "Pixel 7 / 7 Pro", pricePart: "$1,300 MXN", priceInstall: "$1,800 MXN", delivery: "10-12 días hábiles" },
      { name: "Carcasa Trasera", model: "Pixel 7 / 7 Pro", pricePart: "$2,000 MXN", priceInstall: "$2,500 MXN", delivery: "10-12 días hábiles" }
    ]
  },
  {
    series: "Pixel 6 Series",
    id: "pixel-6",
    parts: [
      { name: "Pantalla Original / OEM", model: "Pixel 6 / 6 Pro", pricePart: "$4,800 MXN", priceInstall: "$5,400 MXN", delivery: "10-12 días hábiles" },
      { name: "Batería Nueva Original", model: "Pixel 6 / 6 Pro", pricePart: "$1,300 MXN", priceInstall: "$1,800 MXN", delivery: "10-12 días hábiles" },
      { name: "Carcasa Trasera", model: "Pixel 6 / 6 Pro", pricePart: "$1,800 MXN", priceInstall: "$2,300 MXN", delivery: "10-12 días hábiles" }
    ]
  }
];

export const salesCatalog = [
  {
    series: "Pixel 9 Series",
    id: "pixel-9",
    devices: [
      { name: "Google Pixel 9 Pro XL", specs: "128GB / 16GB RAM - Nuevo Sellado", price: "$23,500 MXN", availability: "Entrega Inmediata", color: "Obsidian / Porcelain" },
      { name: "Google Pixel 9 Pro", specs: "128GB / 16GB RAM - Nuevo Sellado", price: "$20,500 MXN", availability: "Entrega Inmediata", color: "Hazel" },
      { name: "Google Pixel 9", specs: "128GB / 12GB RAM - Nuevo Sellado", price: "$16,500 MXN", availability: "Importación 3-5 días", color: "Wintergreen" }
    ]
  },
  {
    series: "Pixel 8 Series",
    id: "pixel-8",
    devices: [
      { name: "Google Pixel 8 Pro", specs: "128GB / 12GB RAM - Reacondicionado Grado A", price: "$12,500 MXN", availability: "Entrega Inmediata", color: "Bay Blue" },
      { name: "Google Pixel 8", specs: "128GB / 8GB RAM - Reacondicionado Grado A", price: "$9,500 MXN", availability: "Entrega Inmediata", color: "Rose" }
    ]
  },
  {
    series: "Pixel 7 Series",
    id: "pixel-7",
    devices: [
      { name: "Google Pixel 7 Pro", specs: "128GB / 12GB RAM - Reacondicionado Grado A", price: "$8,500 MXN", availability: "Entrega Inmediata", color: "Hazel" },
      { name: "Google Pixel 7", specs: "128GB / 8GB RAM - Reacondicionado Grado A", price: "$6,500 MXN", availability: "Entrega Inmediata", color: "Lemongrass" }
    ]
  }
];
