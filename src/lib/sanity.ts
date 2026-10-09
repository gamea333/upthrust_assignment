// Sanity client for build-time reads. The dataset is public and we only read
// published content, so no token is needed (and none is shipped anywhere).

import { createClient } from '@sanity/client';
import { PUBLIC_SANITY_DATASET, PUBLIC_SANITY_PROJECT_ID } from 'astro:env/server';

export const sanity = createClient({
  // `||` so an empty value left in a local .env still falls back to the real project
  projectId: PUBLIC_SANITY_PROJECT_ID || '1rk7384s',
  dataset: PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-02-19',
  // Always read fresh at build time: content edits trigger a rebuild via webhook.
  useCdn: false,
  perspective: 'published',
});

// One query for the whole page. Images come back as url + intrinsic size so
// Astro can download and optimise them at build time like local assets.
const image = (field: string) =>
  `${field}.asset->{ url, "width": metadata.dimensions.width, "height": metadata.dimensions.height }`;

export const pageQuery = /* groq */ `{
  "settings": *[_id == "siteSettings"][0]{
    title, description, servicesIntro, faqEyebrow, faqTitle, testimonialsTitle,
    "ogImage": ${image('ogImage')}
  },
  "hero": *[_id == "hero"][0]{
    headline, noteLeft, noteRight, capabilities, proofStat, proofLabel
  },
  "clientLogos": *[_type == "clientLogo" && defined(logo.asset)] | order(orderRank) {
    name, "image": ${image('logo')}
  },
  "services": *[_type == "service" && defined(image.asset)] | order(orderRank) {
    title, intro, bullets, note, "imageAlt": image.alt, "image": ${image('image')}
  },
  "faqs": *[_type == "faq"] | order(orderRank) { question, answer },
  "testimonials": *[_type == "testimonial"] | order(orderRank) { quote, name, role, company },
  "footer": *[_id == "footer"][0]
}`;
