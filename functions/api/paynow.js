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

  const reference = `book-${bookId}-${Date.now()}`;
  const amount = book.price_usd.toFixed(2);

  // Paynow hash: MD5 of fields + integration key
  const hashString = `${env.PAYNOW_INTEGRATION_ID}${reference}${amount}${book.title}${env.PAYNOW_RESULT_URL}${env.PAYNOW_RETURN_URL}${env.PAYNOW_INTEGRATION_KEY}`;
  
  const hashBuffer = await crypto.subtle.digest('MD5', new TextEncoder().encode(hashString));
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const payload = new URLSearchParams({
    id: env.PAYNOW_INTEGRATION_ID,
    reference: reference,
    amount: amount,
    additionalinfo: book.title,
    returnurl: env.PAYNOW_RETURN_URL,
    resulturl: env.PAYNOW_RESULT_URL,
    authemail: '',
    status: 'Message',
    hash: hash
  });

  const paynowRes = await fetch('https://www.paynow.co.zw/interface/initiatetransaction', {
    method: 'POST',
    body: payload
  });

  const text = await paynowRes.text();
  const params = new URLSearchParams(text);

  if (params.get('status') === 'Ok') {
    return Response.json({ paymentUrl: params.get('browserurl') });
  } else {
    return Response.json({ error: params.get('error') }, { status: 400 });
  }
    }
