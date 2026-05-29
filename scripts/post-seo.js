import fs from "fs";

const SITE_URL = process.env.VITE_SITE_URL;

// SITEMAP REGISTRY
const SITEMAPS = [
  "/sitemap-static.xml",
  "/sitemap-events.xml"
];

// ROTAS ESTÁTICAS
const routes = [
  {
    path: "/",
    priority: 1.0,
    changefreq: "monthly"
  },
  {
    path: "/atividades",
    priority: 0.9,
    changefreq: "daily"
  },
  {
    path: "/publicacoes",
    priority: 0.8,
    changefreq: "weekly"
  },
  {
    path: "/linhas",
    priority: 0.2,
    changefreq: "monthly"
  },
  {
    path: "/equipe",
    priority: 0.3,
    changefreq: "monthly"
  }
];

const now = new Date().toISOString();

// ----------------------
// SITEMAP ESTÁTICO
// ----------------------
const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `
  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>
`).join("\n")}
</urlset>`;

// ----------------------
// SITEMAP INDEX
// ----------------------
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAPS.map(file => `
  <sitemap>
    <loc>${SITE_URL}${file}</loc>
  </sitemap>
`).join("\n")}
</sitemapindex>`;

// ----------------------
// ROBOTS
// ----------------------
const robots = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /dev
Disallow: /api

# sitemap index 
Sitemap: ${SITE_URL}/sitemap.xml
`;

// ----------------------
// WRITE FILES
// ----------------------
fs.writeFileSync("dist/sitemap-static.xml", staticSitemap);
fs.writeFileSync("dist/sitemap.xml", sitemapIndex);
fs.writeFileSync("dist/robots.txt", robots);

console.log("SEO generated");