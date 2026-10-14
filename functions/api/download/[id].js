export async function onRequestGet({ request, env, params }) {
  const bookId = params.id;

  const bookRes = await fetch(`${env.SUPABASE_URL}/rest/v1/books?id=eq.${bookId}&select=is_free,pdf_path`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE}`
    }
  });
  const [book] = await bookRes.json();

  if (book.is_free) {
    const signedUrl = await getSignedUrl(env, book.pdf_path);
    return Response.redirect(signedUrl);
  }

  const purchaseRes = await fetch(`${env.SUPABASE_URL}/rest/v1/purchases?book_id=eq.${bookId}&select=id`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE}`
    }
  });
  const purchases = await purchaseRes.json();

  if (purchases.length === 0) {
    return new Response('Not purchased', { status: 403 });
  }

  const signedUrl = await getSignedUrl(env, book.pdf_path);
  return Response.redirect(signedUrl);
}

async function getSignedUrl(env, path) {
  const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/sign/books/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expiresIn: 3600 })
  });
  const { signedURL } = await res.json();
  return `${env.SUPABASE_URL}${signedURL}`;
    }
