import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: '1rk7384s', dataset: 'production' },
  // `npm run deploy` publishes the Studio to https://upthrust-design.sanity.studio
  studioHost: 'upthrust-design',
  deployment: { appId: 'bmbmb6k827ij37nsghaxe4qb', autoUpdates: true },
});
