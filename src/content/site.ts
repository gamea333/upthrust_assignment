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

export const faqIntro = {
  eyebrow: 'Good to know',
  title: 'Questions, answered',
};

export const faqs = [
  {
    question: 'What kind of companies do you work with?',
    answer:
      'Mostly ambitious brands at a turning point: startups getting ready to scale, established businesses repositioning, and teams launching something new. If design has to move a number, we are a good fit.',
  },
  {
    question: 'How long does a typical project take?',
    answer:
      'A focused brand identity usually takes 6–8 weeks. Websites and product work run 8–12 weeks depending on scope. We agree on a timeline with clear milestones before anything starts.',
  },
  {
    question: 'Do you only do design, or strategy too?',
    answer:
      'Both. Every project starts with strategy, because good design needs a clear brief. You can also hire us for strategy and workshops on their own.',
  },
  {
    question: 'How do you measure whether the work performs?',
    answer:
      'We set success metrics with you at the start, such as conversion rate, sign-ups or brand recall, and check them after launch. Design that performs is the whole point.',
  },
  {
    question: 'How do we get started?',
    answer:
      'Drop your email in the form below or write to hello@upthrust.agency. We will set up a short call to understand where you are and where you want to go.',
  },
];

export const footer = {
  wordmark: ['Upthrust', 'Design'],
  sites: [
    {
      label: 'upthrust.agency',
      href: 'https://upthrust.agency',
      description: 'Brand, digital and campaign design studio.',
      email: 'hello@upthrust.agency',
    },
    {
      label: 'upthrust.io',
      href: 'https://upthrust.io',
      description: 'Product and growth design for tech teams.',
      email: 'hello@upthrust.io',
    },
  ],
  tagline: 'Bold design that performs.',
  signup: {
    title: 'Sign up for our emails',
    consent:
      'By checking this box you sign up for our newsletter and receive marketing emails and updates on our services. You can unsubscribe at any time.',
    placeholder: 'typehere@youremail.com',
    button: 'Submit',
    success: 'Thanks! You’re on the list. Watch your inbox.',
  },
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  ],
  legal: {
    privacyLabel: 'Privacy Policy',
    privacyHref: '/privacy',
    copyright: '© Upthrust Design',
  },
};
