import { defineCollection, z } from 'astro:content';

const publicationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['Design Thinking', 'Ai Today']),
    description: z.string(),
    image: z.string().optional().default('/assets/og_image.jpg'),
  }),
});

export const collections = {
  publications: publicationsCollection,
};
