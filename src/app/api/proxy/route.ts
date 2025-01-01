import { NextRequest } from "next/server";

export async function GET(req: NextRequest): Promise<Response> {
    try {
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
        return new Response(html, {
            status: response.status
        });
    } catch (error) {
        console.log(error);
        return Response.json({status: 500});
    }
}