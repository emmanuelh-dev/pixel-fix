import { phoneNumber } from "../data/store";

export function localBusinessSchema(opts: {
  name: string;
  description: string;
  priceRange: string;
}) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: opts.name,
    image: "https://www.pixelfixmexico.com/logo.png",
    description: opts.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Monterrey",
      addressRegion: "NL",
      addressCountry: "MX",
    },
    areaServed: { "@type": "City", name: "Monterrey" },
    geo: { "@type": "GeoCoordinates", latitude: 25.6866, longitude: -100.3161 },
    priceRange: opts.priceRange,
    telephone: `+${phoneNumber}`,
  });
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  });
}

export function productSchema(opts: {
  name: string;
  description: string;
  image: string;
  offers: { price: number; name?: string }[];
}) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    image: opts.image,
    brand: { "@type": "Brand", name: "Google Pixel" },
    offers: opts.offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      priceCurrency: "MXN",
      price: offer.price,
      availability: "https://schema.org/InStock",
      areaServed: "MX",
      seller: { "@type": "Organization", name: "Pixel Fix México" },
    })),
  });
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}
