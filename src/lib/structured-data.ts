// schema.org JSON-LD for the home page, built from the same CMS content the page
// renders, so the structured data always matches what visitors see.

import type { Content } from './content';

export function homeStructuredData(content: Content, site: URL): Record<string, unknown>[] {
  const url = site.href;
  const orgId = `${url}#organization`;
  const siteId = `${url}#website`;

  const sameAs = content.footer.social
    .map((link) => link.href)
    .filter((href) => /^https?:\/\/[^/]+\/.+/.test(href)); // skip bare platform homepages

  return [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: 'Upthrust Design',
      url,
      logo: new URL('/apple-touch-icon.png', site).href,
      email: content.footer.sites[0]?.email,
      slogan: 'Bold design that performs',
      ...(sameAs.length ? { sameAs } : {}),
      knowsAbout: content.services.map((service) => service.title),
    },
    {
      '@type': 'WebSite',
      '@id': siteId,
      url,
      name: 'Upthrust Design',
      publisher: { '@id': orgId },
      inLanguage: 'en',
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: content.settings.title,
      description: content.settings.description,
      isPartOf: { '@id': siteId },
      about: { '@id': orgId },
      primaryImageOfPage: new URL('/og-image.jpg', site).href,
      inLanguage: 'en',
    },
    {
      '@type': 'ItemList',
      name: 'Services',
      itemListElement: content.services.map((service, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Service',
          name: service.title,
          description: service.intro,
          provider: { '@id': orgId },
        },
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: content.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ];
}
