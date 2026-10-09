import { defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';

// Singleton: page-wide SEO and section headings.
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'seo', title: 'SEO', default: true },
    { name: 'sections', title: 'Section headings' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      description: 'Shown in the browser tab and search results (50–60 characters).',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.required().max(70),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      description: 'Search result snippet (140–160 characters).',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      description: '1200 × 630 recommended. Used for Open Graph / Twitter cards.',
      type: 'image',
      group: 'seo',
    }),
    defineField({
      name: 'servicesIntro',
      title: 'Services eyebrow',
      description: 'Small line above each service title, e.g. "What can we do for you".',
      type: 'string',
      group: 'sections',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'faqEyebrow',
      title: 'FAQ eyebrow',
      type: 'string',
      group: 'sections',
    }),
    defineField({
      name: 'faqTitle',
      title: 'FAQ heading',
      type: 'string',
      group: 'sections',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'testimonialsTitle',
      title: 'Testimonials heading',
      description: 'Only shown when at least one testimonial is published.',
      type: 'string',
      group: 'sections',
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
