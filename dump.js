const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function dump() {
  const prisma = new PrismaClient();
  
  const siteSettings = await prisma.siteSetting.findMany();
  const settingsMap = {};
  siteSettings.forEach(s => settingsMap[s.key] = s.value);

  const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
  const articles = await prisma.article.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, include: { category: true } });
  
  const rawAboutData = await prisma.article.findFirst({
      where: { category: "GIOI_THIEU" },
      orderBy: { updatedAt: 'desc' }
  });

  const content = `
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
  await prisma.$disconnect();
}
dump().catch(console.error);
