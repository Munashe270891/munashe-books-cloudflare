export async function onRequestPost({ request, env }) {
  const { bookId } = await request.json();
  
  // Get book from Supabase
  const bookRes = await fetch(`${env.SUPABASE_URL}/rest/v1/books?id=eq.${bookId}&select=*`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE}`
    }
  });
  
  const [book] = await bookRes.json();
  if (!book || book.is_free) return new Response('Invalid book', { status: 400 });

  // Create Paynow payment - replace with actual Paynow API call
  const paynowPayload = {
    resulturl: `${new URL(request.url).origin}/api/paynow-webhook`,
    returnurl: `${new URL(request.url).origin}/success`,
    reference: `book-${bookId}-${Date.now()}`,
    amount: book.price_usd,
    id: env.PAYNOW_INTEGRATION_ID,
    additionalinfo: book.title,
    authemail: '' // optional
  };

  // TODO: Add Paynow signature + hash here
  // For now this is placeholder - you'll need Paynow SDK or manual hash
  
  return Response.json({ paymentUrl: 'https://paynow.co.zw/payment/...' });
}
