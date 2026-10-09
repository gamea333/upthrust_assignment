import { defineArrayMember, defineField, defineType } from 'sanity';
import { BlockElementIcon } from '@sanity/icons/BlockElement';

// Singleton: footer copy, links and the newsletter form text.
export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: BlockElementIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'signup', title: 'Newsletter form' },
    { name: 'links', title: 'Links' },
  ],
  fields: [
    defineField({
      name: 'wordmarkLeft',
      title: 'Wordmark: left word',
      type: 'string',
      group: 'content',
      initialValue: 'Upthrust',
    }),
    defineField({
      name: 'wordmarkRight',
      title: 'Wordmark: right word',
      type: 'string',
      group: 'content',
      initialValue: 'Design',
    }),
    defineField({
      name: 'sites',
      title: 'Sites',
      type: 'array',
      group: 'content',
      validation: (r) => r.max(3),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'site',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'url',
              validation: (r) => r.required(),
            }),
            defineField({ name: 'description', title: 'Description', type: 'string' }),
            defineField({ name: 'email', title: 'Email', type: 'email' }),
          ],
          preview: { select: { title: 'label', subtitle: 'email' } },
        }),
      ],
    }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', group: 'content' }),

    defineField({ name: 'signupTitle', title: 'Form heading', type: 'string', group: 'signup' }),
    defineField({
      name: 'signupConsent',
      title: 'Consent text',
      type: 'text',
      rows: 3,
      group: 'signup',
    }),
    defineField({
      name: 'signupPlaceholder',
      title: 'Email placeholder',
      type: 'string',
      group: 'signup',
    }),
    defineField({ name: 'signupButton', title: 'Button label', type: 'string', group: 'signup' }),
    defineField({ name: 'signupSuccess', title: 'Success message', type: 'string', group: 'signup' }),

    defineField({
      name: 'social',
      title: 'Social links',
      type: 'array',
      group: 'links',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'href', title: 'URL', type: 'url', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        }),
      ],
    }),
    defineField({ name: 'copyright', title: 'Copyright line', type: 'string', group: 'links' }),
  ],
  preview: { prepare: () => ({ title: 'Footer' }) },
});
