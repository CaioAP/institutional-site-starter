import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Set this to deploy the studio to <host>.sanity.studio with `pnpm --filter @starter/sanity-studio deploy`.
  studioHost: process.env.SANITY_STUDIO_HOSTNAME || undefined,
})
