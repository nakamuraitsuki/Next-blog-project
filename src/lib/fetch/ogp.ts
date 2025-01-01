import * as cheerio from 'cheerio';

export const getOGP = async (url: string) => {
    const result = await fetch(`http://localhost:3000/api/proxy?url=${url}`);
    const html = await result.text();
    const $ = cheerio.load(html);


    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');

    console.log("OGP Title:", ogTitle);
    console.log("OGP Description:", ogDescription);
    console.log("OGP Image:", ogImage);

    return { ogTitle, ogDescription, ogImage };
}