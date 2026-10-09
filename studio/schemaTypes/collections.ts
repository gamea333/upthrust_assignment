import { defineArrayMember, defineField, defineType } from 'sanity';
import { CommentIcon } from '@sanity/icons/Comment';
import { HelpCircleIcon } from '@sanity/icons/HelpCircle';
import { ImagesIcon } from '@sanity/icons/Images';
import { StarIcon } from '@sanity/icons/Star';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';

// Repeated content. Each type is drag-and-drop orderable in the Studio.

export const clientLogo = defineType({
  name: 'clientLogo',
  title: 'Client logo',
  type: 'document',
  icon: ImagesIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'clientLogo' }),
    defineField({ name: 'name', title: 'Company name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'logo',
      title: 'Logo',
      description: 'PNG with a transparent background. Shown in black, brand colours on hover.',
      type: 'image',
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: 'name', media: 'logo' } },
});

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: StarIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'service' }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'intro',
      title: 'Intro line',
      type: 'text',
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'bullets',
      title: 'Bullet points',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (r) => r.required().min(1).max(6),
    }),
    defineField({
      name: 'note',
      title: 'Extra note (optional)',
      description: 'Small italic text under the bullets.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Collage image',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          description: 'Describe the image for people using screen readers.',
          type: 'string',
          validation: (r) => r.required(),
        }),
      ],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'intro', media: 'image' } },
});

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'faq' }),
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 4,
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: 'question', subtitle: 'answer' } },
});

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: CommentIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'testimonial' }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (r) => r.required().max(400),
    }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string' }),
    defineField({ name: 'company', title: 'Company', type: 'string' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'quote', company: 'company' },
    prepare: ({ title, subtitle, company }) => ({
      title: company ? `${title}, ${company}` : title,
      subtitle,
    }),
  },
});
