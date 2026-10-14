export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.get('key') !== env.ADMIN_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('pdf');
  
  // Upload to Supabase Storage
  const pdfPath = `books/${Date.now()}-${file.name}`;
  await fetch(`${env.SUPABASE_URL}/storage/v1/object/books/${pdfPath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
      'Content-Type': file.type
    },
    body: file.stream()
  });

  // Insert into DB
  await fetch(`${env.SUPABASE_URL}/rest/v1/books`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      title: formData.get('title'),
      description: formData.get('description'),
      pdf_path: pdfPath,
      is_free: formData.get('is_free') === 'true',
      price_usd: parseFloat(formData.get('price')) || null,
      image_url: formData.get('image_url') || null
    })
  });

  return Response.json({ success: true });
}
