export async function onRequestGet({ env }) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/books?select=*&order=created_at.desc`, {
    headers: {
      'apikey': env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
    }
  });

  const books = await res.json();
  return Response.json(books, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}
