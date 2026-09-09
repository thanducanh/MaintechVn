const { Client } = require('pg');
const fs = require('fs');

async function dump() {
  const client = new Client({
    connectionString: "postgresql://postgres.hrlamxiydpidwccqjlqe:Duc%40nh281195@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  const resSettings = await client.query('SELECT * FROM site_settings');
  const settingsMap = {};
  resSettings.rows.forEach(s => settingsMap[s.key] = s.value);

  const resServices = await client.query('SELECT * FROM services WHERE is_active = true ORDER BY "order" ASC');
  const services = resServices.rows;

  const resArticles = await client.query('SELECT * FROM articles WHERE is_active = true ORDER BY created_at DESC');
  const articles = resArticles.rows;

  const resProducts = await client.query('SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC');
  const products = resProducts.rows;

  const resCategories = await client.query('SELECT * FROM categories');
  const categoriesMap = {};
  resCategories.rows.forEach(c => categoriesMap[c.id] = c);
  products.forEach(p => p.category = categoriesMap[p.category_id]);

  const rawAboutData = articles.find(a => a.category === 'GIOI_THIEU');

  const content = `// Auto-generated from database dump

export const siteConfig = {
  logo: '/images/site-logo-maintech.png',
  banner: '/images/maintech-page-banner.png',
  contact: ${settingsMap['contact_info'] ? settingsMap['contact_info'] : JSON.stringify({ email: 'mtv@maintechvn.com.vn', hotline: '+84 918 458 399', address: 'TP. Hồ Chí Minh, Việt Nam' })},
  home: ${settingsMap['homepage_config'] ? settingsMap['homepage_config'] : '{}'},
  about: ${rawAboutData ? JSON.stringify(rawAboutData) : '{}'}
};

export const services = ${JSON.stringify(services, null, 2)};
export const articles = ${JSON.stringify(articles, null, 2)};
export const products = ${JSON.stringify(products, null, 2)};
`;

  fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync('src/data/site-content.ts', content);
  console.log('Dumped to src/data/site-content.ts');
  await client.end();
}

dump().catch(console.error);
