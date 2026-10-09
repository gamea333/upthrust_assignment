import { defineField, defineType } from 'sanity';
import { HomeIcon } from '@sanity/icons/Home';

const note = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    options: { columns: 2 },
    fields: [
      defineField({ name: 'lead', title: 'Text', type: 'string', validation: (r) => r.required() }),
      defineField({
        name: 'marked',
        title: 'Hand-marked words',
        description: 'Gets the orange hand-drawn mark.',
        type: 'string',
        validation: (r) => r.required(),
      }),
    ],
  });

// Singleton: the first screen.
export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline (H1)',
      description:
        'The page’s main heading for search engines and screen readers. The large orange lettering is artwork and stays "Bold design that performs".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    note('noteLeft', 'Left note'),
    note('noteRight', 'Right note'),
    defineField({
      name: 'capabilities',
      title: 'Capabilities list',
      description: 'The last item is underlined.',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1).max(5),
    }),
    defineField({
      name: 'proofStat',
      title: 'Proof number',
      type: 'string',
      initialValue: '100+',
    }),
    defineField({ name: 'proofLabel', title: 'Proof label', type: 'string' }),
  ],
  preview: { select: { title: 'headline' }, prepare: ({ title }) => ({ title, subtitle: 'Hero' }) },
});
