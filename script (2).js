const SUPABASE_URL = 'https://wufdprbsbscygdwufglq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OLRirO6wD2gAqvVh_rWQUg_z1IGNnW0';
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// ---------- MOBILE NAV ----------

const navToggle = document.getElementById('navToggle');
const navLinksEl = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', function () {
    navLinksEl.classList.toggle('open');
  });
}

// ---------- WHATSAPP ORDER BUTTONS ----------
// Uses event delegation so it also works for product cards that get
// added to the page later by loadAllProducts() / loadFeaturedProducts().

document.addEventListener('click', function (event) {

  const btn = event.target.closest('.order-btn[data-product]');
  if (!btn) return;

  event.preventDefault();

  const product = btn.dataset.product;
  const message = `Hi! I would like to order the ${product}.`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/2349126831215?text=${encodedMessage}`;

  window.open(whatsappURL, '_blank');
});

// ---------- SHARED PRODUCT CARD MARKUP ----------

function buildShopCard(p) {
  return `
    <div class="shop-card">
      <img src="${p.image_url}" alt="${p.name}">
      <div class="shop-card-info">
        <h3>${p.name}</h3>
        <p class="shop-price">₦${Number(p.price).toLocaleString()}</p>
        <a href="#" class="order-btn" data-product="${p.name}">Order on Whatsapp</a>
      </div>
    </div>
  `;
}

// ---------- COLLECTIONS PAGE ----------

const productContainer = document.getElementById('productContainer');
let allProducts = [];

if (productContainer) {

  loadAllProducts();

  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts(btn.dataset.category);
    });
  });
}

async function loadAllProducts() {

  productContainer.innerHTML = '<p class="loading-text">Loading products…</p>';

  let { data, error } = await _supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Load products error:', error);
    productContainer.innerHTML = '<p class="loading-text">Could not load products right now.</p>';
    return;
  }

  allProducts = data;
  renderProducts('all');
}

function renderProducts(category) {

  let list = category === 'all'
    ? allProducts
    : allProducts.filter(function (p) { return p.category === category; });

  if (list.length === 0) {
    productContainer.innerHTML = '<p class="loading-text">No products in this category yet.</p>';
    return;
  }

  productContainer.innerHTML = list.map(buildShopCard).join('');
}

// ---------- HOMEPAGE FEATURED PRODUCTS ----------

const featuredContainer = document.getElementById('featuredContainer');

if (featuredContainer) {
  loadFeaturedProducts();
}

async function loadFeaturedProducts() {

  featuredContainer.innerHTML = '<p class="loading-text">Loading…</p>';

  let { data, error } = await _supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Load featured error:', error);
    featuredContainer.innerHTML = '<p class="loading-text">Could not load products right now.</p>';
    return;
  }

  if (data.length === 0) {
    featuredContainer.innerHTML = '<p class="loading-text">New pieces coming soon.</p>';
    return;
  }

  featuredContainer.innerHTML = data.map(buildShopCard).join('');
}
