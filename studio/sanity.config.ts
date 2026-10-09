import { defineConfig } from 'sanity';
import { structureTool, type StructureResolver } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { CogIcon } from '@sanity/icons/Cog';
import { HomeIcon } from '@sanity/icons/Home';
import { BlockElementIcon } from '@sanity/icons/BlockElement';
import { schemaTypes, singletonTypes } from './schemaTypes';

const projectId = '1rk7384s';
const dataset = 'production';

// Sidebar: singletons open straight into their one document; collections can be
// reordered by drag and drop (that order is what the site uses).
const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('Hero')
        .icon(HomeIcon)
        .child(S.document().schemaType('hero').documentId('hero')),
      S.divider(),
      orderableDocumentListDeskItem({ type: 'clientLogo', title: 'Client logos', S, context }),
      orderableDocumentListDeskItem({ type: 'service', title: 'Services', S, context }),
      orderableDocumentListDeskItem({ type: 'faq', title: 'FAQs', S, context }),
      orderableDocumentListDeskItem({ type: 'testimonial', title: 'Testimonials', S, context }),
      S.divider(),
      S.listItem()
        .title('Footer')
        .icon(BlockElementIcon)
        .child(S.document().schemaType('footer').documentId('footer')),
    ]);

export default defineConfig({
  name: 'upthrust',
  title: 'Upthrust',
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // Singletons can't be created again from the "new document" menu.
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    // ...or duplicated / deleted.
    actions: (actions, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? actions.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
});
