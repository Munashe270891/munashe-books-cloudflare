export async function onRequestPost({ request, env }) {
  const body = await request.text();
  const params = new URLSearchParams(body);

  const hashString = `${params.get('reference')}${params.get('amount')}${params.get('paynowreference')}${params.get('status')}${env.PAYNOW_INTEGRATION_KEY}`;
  const hash = await crypto.subtle.digest('MD5', new TextEncoder().encode(hashString))
   .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

  if (hash!== params.get('hash')) {
    return new Response('Invalid hash', { status: 400 });
  }

  if (params.get('status') === 'Paid') {
    const bookId = params.get('reference').split('-')[1];

    await fetch(`${env.SUPABASE_URL}/rest/v1/purchases`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        book_id: bookId,
        paynow_reference: params.get('paynowreference'),
        paid_at: new Date().toISOString()
      })
    });
  }

  return new Response('OK');
  }
