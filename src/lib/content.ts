// Page content, read from Sanity at build time.
//
// Each section falls back to the bundled copy in src/content/site.ts when Sanity
// is unreachable or the section is empty, so a CMS outage or a half-filled
// dataset can never break a deploy. Testimonials are the exception: an empty
// list there just means "don't show the section".

import type { ImageMetadata } from 'astro';
import { pageQuery, sanity } from './sanity';
import * as fallback from '../content/site';

/** A local (bundled) image or a remote one from the Sanity CDN. */
export type ImageRef = ImageMetadata | { src: string; width: number; height: number };

type SanityImage = { url: string; width: number; height: number } | null;

type PageData = {
  settings: {
    title?: string;
    description?: string;
    servicesIntro?: string;
    faqEyebrow?: string;
    faqTitle?: string;
    testimonialsTitle?: string;
    ogImage?: SanityImage;
  } | null;
  hero: {
    headline?: string;
    noteLeft?: { lead: string; marked: string };
    noteRight?: { lead: string; marked: string };
    capabilities?: string[];
    proofStat?: string;
    proofLabel?: string;
  } | null;
  clientLogos: { name: string; image: SanityImage }[];
  services: {
    title: string;
    intro: string;
    bullets: string[];
    note?: string;
    imageAlt?: string;
    image: SanityImage;
  }[];
  faqs: { question: string; answer: string }[];
  testimonials: { quote: string; name: string; role?: string; company?: string }[];
  footer: {
    wordmarkLeft?: string;
    wordmarkRight?: string;
    sites?: { label: string; href: string; description?: string; email?: string }[];
    tagline?: string;
    signupTitle?: string;
    signupConsent?: string;
    signupPlaceholder?: string;
    signupButton?: string;
    signupSuccess?: string;
    social?: { label: string; href: string }[];
    copyright?: string;
  } | null;
};

const remote = (img: SanityImage): ImageRef | undefined =>
  img?.url ? { src: img.url, width: img.width, height: img.height } : undefined;

const nonEmpty = <T>(list: T[] | undefined | null): list is T[] =>
  Array.isArray(list) && list.length > 0;

async function load() {
  let data: Partial<PageData> = {};
  try {
    data = await sanity.fetch<PageData>(pageQuery);
  } catch (error) {
    console.warn('[content] Sanity unavailable, using bundled content.', error);
  }

  const s = data.settings ?? {};
  const h = data.hero ?? {};
  const f = data.footer ?? {};

  return {
    settings: {
      title: s.title ?? fallback.settings.title,
      description: s.description ?? fallback.settings.description,
      ogImage: remote(s.ogImage ?? null),
    },

    hero: {
      headline: h.headline ?? fallback.hero.headline,
      notes: {
        left: h.noteLeft ?? fallback.hero.notes.left,
        right: h.noteRight ?? fallback.hero.notes.right,
      },
      capabilities: nonEmpty(h.capabilities) ? h.capabilities : fallback.hero.capabilities,
      proof: {
        stat: h.proofStat ?? fallback.hero.proof.stat,
        label: h.proofLabel ?? fallback.hero.proof.label,
      },
    },

    clientLogos: nonEmpty(data.clientLogos)
      ? data.clientLogos.map((logo) => ({ name: logo.name, image: remote(logo.image)! }))
      : fallback.clientLogos.map((logo): { name: string; image: ImageRef } => logo),

    servicesIntro: s.servicesIntro ?? fallback.servicesIntro,
    services: nonEmpty(data.services)
      ? data.services.map((service) => ({
          title: service.title,
          intro: service.intro,
          bullets: service.bullets ?? [],
          note: service.note,
          image: remote(service.image)!,
          imageAlt: service.imageAlt ?? '',
        }))
      : fallback.services.map(
          (service): (typeof fallback.services)[number] & { image: ImageRef; note?: string } =>
            service,
        ),

    faqIntro: {
      eyebrow: s.faqEyebrow ?? fallback.faqIntro.eyebrow,
      title: s.faqTitle ?? fallback.faqIntro.title,
    },
    faqs: nonEmpty(data.faqs) ? data.faqs : fallback.faqs,

    testimonialsTitle: s.testimonialsTitle ?? fallback.testimonialsTitle,
    testimonials: data.testimonials ?? [],

    footer: {
      wordmark: [
        f.wordmarkLeft ?? fallback.footer.wordmark[0],
        f.wordmarkRight ?? fallback.footer.wordmark[1],
      ] as [string, string],
      sites: nonEmpty(f.sites) ? f.sites : fallback.footer.sites,
      tagline: f.tagline ?? fallback.footer.tagline,
      signup: {
        title: f.signupTitle ?? fallback.footer.signup.title,
        consent: f.signupConsent ?? fallback.footer.signup.consent,
        placeholder: f.signupPlaceholder ?? fallback.footer.signup.placeholder,
        button: f.signupButton ?? fallback.footer.signup.button,
        success: f.signupSuccess ?? fallback.footer.signup.success,
      },
      social: nonEmpty(f.social) ? f.social : fallback.footer.social,
      legal: {
        ...fallback.footer.legal,
        copyright: f.copyright ?? fallback.footer.legal.copyright,
      },
    },
  };
}

export type Content = Awaited<ReturnType<typeof load>>;

// Fetched once per build and shared by every component.
let cached: Promise<Content> | undefined;
export const getContent = () => (cached ??= load());

/**
 * Props for <Image>/<Picture> from an ImageRef, optionally scaled to a target
 * width or height (keeping the aspect ratio for remote images).
 */
export function imageSource(ref: ImageRef, target: { width?: number; height?: number } = {}) {
  if ('format' in ref) return { src: ref, ...target };
  const ratio = ref.width / ref.height;
  const width = target.width ?? (target.height ? Math.round(target.height * ratio) : ref.width);
  const height = target.height ?? Math.round(width / ratio);
  return { src: ref.src, width, height };
}
