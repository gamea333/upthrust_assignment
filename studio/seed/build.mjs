// Writes seed/content.ndjson with the site's launch content, ready for
// `sanity dataset import`. Images are uploaded from seed/images.
// Run via `npm run seed` (needs `npx sanity login` first).

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const image = (file, extra = {}) => ({
  _type: 'image',
  _sanityAsset: `image@${pathToFileURL(join(here, 'images', file)).href}`,
  ...extra,
});
const rank = (i) => `0|${String(100000 + i * 100000).padStart(6, '0')}:`;
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);

const docs = [
  {
    _id: 'siteSettings',
    _type: 'siteSettings',
    title: 'Upthrust Design — Bold design that performs',
    description:
      'Upthrust is a strategy-led design studio for brand identity, digital products and campaigns.',
    servicesIntro: 'What can we do for you',
    faqEyebrow: 'Good to know',
    faqTitle: 'Questions, answered',
    testimonialsTitle: 'What clients say',
  },
  {
    _id: 'hero',
    _type: 'hero',
    headline: 'Bold design that performs',
    noteLeft: { lead: 'Strategy is', marked: 'cheaper' },
    noteRight: { lead: 'Comfortable', marked: 'is expensive' },
    capabilities: ['Identity', 'Experience', 'Motion'],
    proofStat: '100+',
    proofLabel: 'Brands trusted us to define how they’re seen.',
  },

  ...[
    ['Zomato', 'zomato.png'],
    ['Bosch', 'bosch.png'],
    ['L’Oréal', 'loreal.png'],
    ['Vega', 'vega.png'],
    ['Dell', 'dell.png'],
  ].map(([name, file], i) => ({
    _id: `clientLogo-${key(name)}`,
    _type: 'clientLogo',
    orderRank: rank(i),
    name,
    logo: image(file),
  })),

  ...[
    {
      title: 'Strategy and Insight',
      intro: 'We interrogate what others assume. Then we build the brief behind the brief.',
      bullets: [
        'Brand strategy & positioning',
        'Messaging & tone of voice',
        'Audience & competitor research',
        'Workshops & creative sprints',
      ],
      file: 'service-1.png',
      alt: 'Strategy workshop boards with audience personas and research notes',
    },
    {
      title: 'Brand & visual identity',
      intro:
        'We build systems, not just logos. So you own the category, not just the conversation.',
      bullets: [
        'Brand identity & visual language',
        'Guidelines & naming',
        'Illustration & iconography',
        'Brand architecture & systems',
      ],
      file: 'service-2.png',
      alt: 'Brand identity collage with colour palette, icons and a website mockup',
    },
    {
      title: 'Product & digital experience',
      intro: 'We design for humans and metrics. So users stay, engage, and come back.',
      bullets: [
        'UI/UX & website design',
        'Design systems & prototyping',
        'User research & testing',
        'Motion graphics & micro-interactions',
      ],
      file: 'service-3.png',
      alt: 'Product design collage with dashboard screens, typography and UI components',
    },
    {
      title: 'Creative & campaign production',
      intro: 'We turn attention into action. Then we prove it worked.',
      bullets: [
        'Campaign creative & social content',
        'Presentations & pitch decks',
        'Marketing collateral & ad creative',
      ],
      note: 'psst.. Also, physical spaces. Because not everything happens on a screen: experiential and spatial design for exhibitions, placemaking and branded environments. Just ask.',
      file: 'service-4.png',
      alt: 'Campaign collage with billboards, posters and social ads',
    },
  ].map(({ file, alt, ...service }, i) => ({
    _id: `service-${i + 1}`,
    _type: 'service',
    orderRank: rank(i),
    ...service,
    image: image(file, { alt }),
  })),

  ...[
    [
      'What kind of companies do you work with?',
      'Mostly ambitious brands at a turning point: startups getting ready to scale, established businesses repositioning, and teams launching something new. If design has to move a number, we are a good fit.',
    ],
    [
      'How long does a typical project take?',
      'A focused brand identity usually takes 6–8 weeks. Websites and product work run 8–12 weeks depending on scope. We agree on a timeline with clear milestones before anything starts.',
    ],
    [
      'Do you only do design, or strategy too?',
      'Both. Every project starts with strategy, because good design needs a clear brief. You can also hire us for strategy and workshops on their own.',
    ],
    [
      'How do you measure whether the work performs?',
      'We set success metrics with you at the start, such as conversion rate, sign-ups or brand recall, and check them after launch. Design that performs is the whole point.',
    ],
    [
      'How do we get started?',
      'Drop your email in the form below or write to hello@upthrust.agency. We will set up a short call to understand where you are and where you want to go.',
    ],
  ].map(([question, answer], i) => ({
    _id: `faq-${i + 1}`,
    _type: 'faq',
    orderRank: rank(i),
    question,
    answer,
  })),

  {
    _id: 'footer',
    _type: 'footer',
    wordmarkLeft: 'Upthrust',
    wordmarkRight: 'Design',
    sites: [
      {
        _key: 'agency',
        _type: 'site',
        label: 'upthrust.agency',
        href: 'https://upthrust.agency',
        description: 'Brand, digital and campaign design studio.',
        email: 'hello@upthrust.agency',
      },
      {
        _key: 'io',
        _type: 'site',
        label: 'upthrust.io',
        href: 'https://upthrust.io',
        description: 'Product and growth design for tech teams.',
        email: 'hello@upthrust.io',
      },
    ],
    tagline: 'Bold design that performs.',
    signupTitle: 'Sign up for our emails',
    signupConsent:
      'By checking this box you sign up for our newsletter and receive marketing emails and updates on our services. You can unsubscribe at any time.',
    signupPlaceholder: 'typehere@youremail.com',
    signupButton: 'Submit',
    signupSuccess: 'Thanks! You’re on the list. Watch your inbox.',
    social: [
      { _key: 'instagram', _type: 'socialLink', label: 'Instagram', href: 'https://www.instagram.com/' },
      { _key: 'linkedin', _type: 'socialLink', label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    ],
    copyright: '© Upthrust Design',
  },
];

const out = join(here, 'content.ndjson');
writeFileSync(out, docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
console.log(`Wrote ${docs.length} documents to ${out}`);
