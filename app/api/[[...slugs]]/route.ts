// app/api/[[...slugs]]/route.ts

export async function GET(request: Request) {

    console.log(request)

    return new Response('Hello World')

}