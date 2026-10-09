import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: '1rk7384s', dataset: 'production' },
  // `npm run deploy` publishes the Studio to https://upthrust.sanity.studio
  studioHost: 'upthrust',
  autoUpdates: true,
});
