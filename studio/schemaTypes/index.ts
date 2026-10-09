import { siteSettings } from './siteSettings';
import { hero } from './hero';
import { footer } from './footer';
import { clientLogo, faq, service, testimonial } from './collections';

export const singletonTypes = new Set(['siteSettings', 'hero', 'footer']);

export const schemaTypes = [siteSettings, hero, footer, clientLogo, service, faq, testimonial];
