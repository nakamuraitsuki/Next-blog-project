import * as cheerio from 'cheerio';
import { ogpData } from '../type';

export const getOGP = async (url: string): Promise<ogpData> => {
    try {
        const proxyUrl = process.env.API_PROXY_URL; //proxyサーバーURL
        const result = await fetch(`${proxyUrl}?url=${url}`); //リクエスト飛ばす
        const html = await result.text(); //testで処理
    
        const $ = cheerio.load(html);

        const ogTitle = $('meta[property="og:title"]').attr('content') ?? $('title').text() ?? "Untitled Page";
        const ogDescription = $('meta[property="og:description"]').attr('content') ?? "";
        const ogImageUrl = $('meta[property="og:image"]').attr('content') ?? null;
        const res: ogpData = { ogTitle, ogDescription, ogImageUrl }
        return res;
    } catch (error) {
        console.log(error);
        return {
            ogTitle: "Error",
            ogDescription: "No description available",
            ogImageUrl: null
        }
    }
}