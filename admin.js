const SUPABASE_URL = 'https://wufdprbsbscygdwufglq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OLRirO6wD2gAqvVh_rWQUg_z1IGNnW0';
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');

async function init() {

  let { data } = await _supabase.auth.getSession();

  if (data.session) {
    showAdmin();
    loadProducts();
  } else {
    showLogin();
  }

  _supabase.auth.onAuthStateChange(function (event, session) {
    if (session) {
      showAdmin();
      loadProducts();
    } else {
      showLogin();
    }
  });
}

function showAdmin() {
  loginSection.style.display = 'none';
  adminSection.style.display = 'block';
}

function showLogin() {
  loginSection.style.display = 'block';
  adminSection.style.display = 'none';
}

async function login() {

  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Enter your email and password');
    return;
  }

  let { error } = await _supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert(error.message);
  }
}

async function logout() {
  await _supabase.auth.signOut();
}

async function addProduct() {

  let name = document.getElementById('productName').value.trim();
  let category = document.getElementById('productCategory').value;
  let price = document.getElementById('productPrice').value;
  let file = document.getElementById('productImage').files[0];

  if (!name || !category || !price || !file) {
    alert('Fill in the name, category, price, and choose a photo');
    return;
  }

  let addBtn = document.getElementById('addProductBtn');
  addBtn.disabled = true;
  addBtn.innerText = 'Uploading…';

  let filePath = Date.now() + '-' + file.name.replace(/\s+/g, '-');

  let { error: uploadError } = await _supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    alert('Photo upload failed: ' + uploadError.message);
    addBtn.disabled = false;
    addBtn.innerText = 'Add Product';
    return;
  }

  let { data: urlData } = _supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  let { error: insertError } = await _supabase
    .from('products')
    .insert([{
      name: name,
      category: category,
      price: Number(price),
      image_path: filePath,
      image_url: urlData.publicUrl
    }]);

  addBtn.disabled = false;
  addBtn.innerText = 'Add Product';

  if (insertError) {
    console.error('Insert error:', insertError);
    alert('Could not save product: ' + insertError.message);
    return;
  }

  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productImage').value = '';

  loadProducts();
}

async function loadProducts() {

  let { data, error } = await _supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Load error:', error);
    return;
  }

  let list = document.getElementById('adminProductList');
  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = '<p class="loading-text">No products yet — add your first one above.</p>';
    return;
  }

  data.forEach(function (p) {
    list.innerHTML += `
      <div class="admin-product-row">
        <img src="${p.image_url}" alt="${p.name}">
        <div class="admin-product-info">
          <strong>${p.name}</strong>
          <span>${p.category}</span>
          <span>₦${Number(p.price).toLocaleString()}</span>
        </div>
        <button class="admin-delete-btn" onclick="deleteProduct('${p.id}', '${p.image_path}')">Delete</button>
      </div>
    `;
  });
}

async function deleteProduct(id, imagePath) {

  let confirmed = confirm('Delete this product? This cannot be undone.');
  if (!confirmed) return;

  if (imagePath) {
    await _supabase.storage.from('product-images').remove([imagePath]);
  }

  let { error } = await _supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('Delete error:', error);
    alert('Could not delete product');
    return;
  }

  loadProducts();
}

document.addEventListener('DOMContentLoaded', init);
