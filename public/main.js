
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/books');
    if (!res.ok) throw new Error('Failed to load books');
    const books = await res.json();

    const featured = books.filter(b => b.is_featured);
    const remaining = books.filter(b => !b.is_featured);

    renderBooks(featured, 'featured-grid', true);
    renderBooks(remaining, 'book-grid', false);
  } catch (err) {
    console.error(err);
    document.getElementById('book-grid').innerHTML = '<p>Unable to load books.</p>';
  }
});

function renderBooks(books, containerId, isFeatured) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  books.forEach(book => {
    const card = document.createElement('article');
    card.className = isFeatured ? 'card card-featured' : 'card';

    const downloadBtn = book.is_free 
      ? `<a href="/api/download/${book.id}" class="btn btn-primary">Download Free</a>`
      : `<button onclick="buyBook(${book.id})" class="btn btn-primary">Buy $${book.price_usd}</button>`;

    card.innerHTML = `
      <div class="card-image-container">
        <img src="${book.image_url}" alt="${book.title}" loading="lazy">
        ${isFeatured ? '<div class="bestseller-badge">BESTSELLER</div>' : ''}
      </div>
      ### ${book.title}
      <p>${book.description}</p>
      <div class="card-actions">
        ${downloadBtn}
        <button onclick="shareBook('${book.title}', '${window.location.origin}/book/${book.id}')" class="btn btn-share">Share</button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function buyBook(bookId) {
  const res = await fetch('/api/paynow', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ bookId })
  });
  const { paymentUrl } = await res.json();
  window.location.href = paymentUrl;
}

async function shareBook(title, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text: `Check out "${title}" by Munashe Soka:`, url });
    } catch {}
  } else {
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }
}
