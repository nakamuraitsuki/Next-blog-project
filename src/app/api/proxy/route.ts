import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    console.log("proxy start");
    const searchParams = req.nextUrl.searchParams;
    const url = searchParams.get('url');
    if(url === null) {
        console.log("error: proxy");
        return Response.json({status: 500});
    }
    const response = await fetch(url, {
        headers: { 'Content-Type': 'text/html'}
    });
    const html = await response.text();
    return new Response(html);
}