// Page content. Phase 7 swaps this for Sanity queries; the shape stays the same
// so components don't need to change.

import zomato from '../assets/logos/zomato.png';
import bosch from '../assets/logos/bosch.png';
import loreal from '../assets/logos/loreal.svg';
import vega from '../assets/logos/vega.png';
import dell from '../assets/logos/dell.png';
import service1 from '../assets/images/service-1.png';
import service2 from '../assets/images/service-2.png';
import service3 from '../assets/images/service-3.png';
import service4 from '../assets/images/service-4.png';

export const hero = {
  headline: 'Bold design that performs',
  notes: {
    left: { lead: 'Strategy is', marked: 'cheaper' },
    right: { lead: 'Comfortable', marked: 'is expensive' },
  },
  capabilities: ['Identity', 'Experience', 'Motion'],
  proof: {
    stat: '100+',
    label: 'Brands trusted us to define how they’re seen.',
  },
};

export const clientLogos = [
  { name: 'Zomato', image: zomato },
  { name: 'Bosch', image: bosch },
  { name: 'L’Oréal', image: loreal },
  { name: 'Vega', image: vega },
  { name: 'Dell', image: dell },
];

export const servicesIntro = 'What can we do for you';

export const services = [
  {
    title: 'Strategy and Insight',
    intro: 'We interrogate what others assume. Then we build the brief behind the brief.',
    bullets: [
      'Brand strategy & positioning',
      'Messaging & tone of voice',
      'Audience & competitor research',
      'Workshops & creative sprints',
    ],
    image: service1,
    imageAlt: 'Strategy workshop boards with audience personas and research notes',
  },
  {
    title: 'Brand & visual identity',
    intro: 'We build systems, not just logos. So you own the category, not just the conversation.',
    bullets: [
      'Brand identity & visual language',
      'Guidelines & naming',
      'Illustration & iconography',
      'Brand architecture & systems',
    ],
    image: service2,
    imageAlt: 'Brand identity collage with colour palette, icons and a website mockup',
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
    image: service3,
    imageAlt: 'Product design collage with dashboard screens, typography and UI components',
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
    image: service4,
    imageAlt: 'Campaign collage with billboards, posters and social ads',
  },
];
