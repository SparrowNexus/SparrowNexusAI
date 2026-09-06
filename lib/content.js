import { list, put } from '@vercel/blob';

export const defaults = {
  site:{brand:'SPARROWNEXUS', email:'sparrowsnexus@gmail.com', location:'India · Global'},
  hero:{eyebrow:'A DIGITAL ATELIER FOR MOVING IDEAS', title:'Make|technology|feel alive.', description:'We design and engineer websites, AI applications and digital systems for companies that would rather be remembered than merely understood.'},
  services:[
    {n:'01',t:'Web experiences',d:'Editorial, high-performance websites where interface, motion and brand behave as one system.',meta:'Strategy / Design / Engineering'},
    {n:'02',t:'AI applications',d:'Useful AI products with thoughtful workflows, dependable interfaces and a clear path from prototype to production.',meta:'Product / AI / Engineering'},
    {n:'03',t:'Digital systems',d:'Design systems, platforms and internal tools that make complicated operations feel remarkably simple.',meta:'Systems / UX / Build'}
  ],
  projects:[
    {n:'01',k:'AI / PRODUCT',title:'A quieter way to work with intelligence.',desc:'An AI operating layer designed around human decisions rather than model theatre.',details:'A product concept focused on calm, human-centred AI workflows. The interface turns complex model behaviour into clear decisions, actions and feedback.'},
    {n:'02',k:'WEB / EXPERIENCE',title:'A digital world with a sense of place.',desc:'A spatial brand experience where every scroll changes the relationship between type, image and information.',details:'A scroll-led brand world where typography, movement and spatial composition create a distinct digital identity.'},
    {n:'03',k:'SYSTEM / PLATFORM',title:'Complexity, made legible.',desc:'A modular platform that turns a dense operational ecosystem into one coherent visual language.',details:'A system-first interface designed to reduce cognitive load while preserving the richness of a complex operational product.'}
  ]
};

const blobPath = 'sparrow/content.json';

export async function readContent(){
  if (!process.env.BLOB_READ_WRITE_TOKEN) return defaults;
  try {
    const result = await list({prefix: blobPath, limit: 10});
    const item = result.blobs.find(b => b.pathname === blobPath) || result.blobs[0];
    if (!item?.url) return defaults;
    const response = await fetch(item.url, {cache:'no-store'});
    if (!response.ok) return defaults;
    return await response.json();
  } catch (error) {
    console.error('Content read failed:', error);
    return defaults;
  }
}

export async function writeContent(content){
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is not configured.');
  await put(blobPath, JSON.stringify(content, null, 2), {
    access:'public',
    addRandomSuffix:false,
    contentType:'application/json',
    cacheControlMaxAge:0
  });
  return content;
}
