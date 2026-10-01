const products = [
  { id: 1, name: 'قميص لينن واسع', category: 'ملابس', price: 890, tag: 'وصل حديثًا', color: 'أخضر زيتوني', image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=760&q=82', best: true },
  { id: 2, name: 'جاكيت يومي خفيف', category: 'ملابس', price: 1450, tag: 'الأكثر مبيعًا', color: 'كريمي', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=760&q=82', best: true },
  { id: 3, name: 'بنطلون كارجو مريح', category: 'ملابس', price: 1190, tag: 'اختيار RASI', color: 'رمادي', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=760&q=82', best: false },
  { id: 4, name: 'شنطة كتف صغيرة', category: 'إكسسوارات', price: 740, tag: 'وصل حديثًا', color: 'بني', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=760&q=82', best: true },
  { id: 5, name: 'تيشيرت قطن أساسي', category: 'ملابس', price: 520, tag: 'أساسيات', color: 'أبيض', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=760&q=82', best: false },
  { id: 6, name: 'نظارة شمس كلاسيك', category: 'إكسسوارات', price: 650, tag: 'الأكثر مبيعًا', color: 'أسود', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=760&q=82', best: true },
  { id: 7, name: 'قميص مخطط خفيف', category: 'ملابس', price: 990, tag: 'وصل حديثًا', color: 'أزرق', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=760&q=82', best: false },
  { id: 8, name: 'حزام جلد بسيط', category: 'إكسسوارات', price: 430, tag: 'اختيار RASI', color: 'بني غامق', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=760&q=82', best: false }
];

const readStore = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
let cart = readStore('rasiCart', []);
let favorites = readStore('rasiFavorites', []);
let category = 'الكل';
let query = '';
let toastTimer;
const $ = (selector) => document.querySelector(selector);
const price = (amount) => `${new Intl.NumberFormat('ar-EG').format(amount)} ج.م`;

function toast(message) {
  const box = $('#toast');
  box.textContent = message;
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), 2400);
}

function renderProducts() {
  let list = products.filter((item) => {
    const categoryMatch = category === 'الكل' || (category === 'الأكثر مبيعًا' ? item.best : item.category === category);
    const searchMatch = `${item.name} ${item.category} ${item.color}`.includes(query.trim());
    return categoryMatch && searchMatch;
  });
  if ($('#sort').value === 'low') list = [...list].sort((a, b) => a.price - b.price);
  if ($('#sort').value === 'high') list = [...list].sort((a, b) => b.price - a.price);
  $('#products').innerHTML = list.map((item, index) => `<article class="product" style="animation-delay:${Math.min(index * 40, 200)}ms"><div class="product-image" data-product="${item.id}" role="button" tabindex="0" aria-label="تفاصيل ${item.name}"><img src="${item.image}" alt="${item.name} باللون ${item.color}" loading="lazy"><span class="tag">${item.tag}</span><button class="favorite ${favorites.includes(item.id) ? 'on' : ''}" data-favorite="${item.id}" aria-label="المفضلة">${favorites.includes(item.id) ? '♥' : '♡'}</button><button class="quick-add" data-add="${item.id}">أضيفي للسلة +</button></div><div class="product-info"><div><h3>${item.name}</h3><p>${item.color} · ${item.category}</p></div><strong class="price">${price(item.price)}</strong></div></article>`).join('');
  $('#empty').hidden = list.length !== 0;
}

function setCategory(next) {
  category = next;
  document.querySelectorAll('.filter').forEach((button) => button.classList.toggle('active', button.dataset.category === next));
  renderProducts();
  $('#shop').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  $('#cart-count').textContent = new Intl.NumberFormat('ar-EG').format(count);
  $('#cart-subcount').textContent = `(${new Intl.NumberFormat('ar-EG').format(count)})`;
  $('#cart-empty').hidden = cart.length > 0;
  $('#cart-bottom').hidden = cart.length === 0;
  $('#cart-items').innerHTML = cart.map((row) => {
    const item = products.find((product) => product.id === row.id);
    if (!item) return '';
    return `<article class="cart-row"><img src="${item.image}" alt=""><div><h3>${item.name}</h3><p>${price(item.price)}</p><div class="quantity"><button data-change="-1" data-id="${item.id}" aria-label="تقليل الكمية">−</button><span>${row.quantity}</span><button data-change="1" data-id="${item.id}" aria-label="زيادة الكمية">+</button></div></div><button class="remove" data-remove="${item.id}">حذف</button></article>`;
  }).join('');
  const total = cart.reduce((sum, row) => sum + (products.find((item) => item.id === row.id)?.price ?? 0) * row.quantity, 0);
  $('#cart-total').textContent = price(total);
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  localStorage.setItem('rasiCart', JSON.stringify(cart));
  renderCart();
  toast('اتضافت لسلتك بنجاح');
}

function openCart() {
  $('#cart').classList.add('open');
  $('#cart').setAttribute('aria-hidden', 'false');
  $('#backdrop').hidden = false;
  requestAnimationFrame(() => $('#backdrop').classList.add('show'));
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('#cart').classList.remove('open');
  $('#cart').setAttribute('aria-hidden', 'true');
  $('#backdrop').classList.remove('show');
  setTimeout(() => { if (!$('#cart').classList.contains('open')) $('#backdrop').hidden = true; }, 250);
  document.body.style.overflow = '';
}

function route(page) {
  if (page === 'admin' && !localStorage.getItem('rasiAdmin')) page = 'login';
  document.querySelectorAll('.page').forEach((view) => { view.hidden = view.id !== `${page}-page`; });
  history.replaceState(null, '', `#${page}`);
  $('#nav').classList.remove('open');
  if (page === 'admin') renderAdmin('overview');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function renderOrders(orders) {
  if (!orders.length) return '<div class="table-wrap admin-empty">لسه مفيش طلبات مسجلة.</div>';
  return `<div class="table-wrap"><table><thead><tr><th>رقم الطلب</th><th>عدد القطع</th><th>الإجمالي</th><th>الحالة</th></tr></thead><tbody>${orders.map((order) => `<tr><td>${order.id}</td><td>${order.count}</td><td>${price(order.total)}</td><td><span class="pill">${order.status}</span></td></tr>`).join('')}</tbody></table></div>`;
}
function renderAdmin(tab = 'overview') {
  document.querySelectorAll('.admin-tab').forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
  const orders = readStore('rasiOrders', []);
  const messages = readStore('rasiMessages', []);
  if (tab === 'overview') {
    $('#admin-content').innerHTML = `<div class="stats"><div class="stat"><span>إجمالي المنتجات</span><strong>${products.length}</strong></div><div class="stat"><span>طلبات تجريبية</span><strong>${orders.length}</strong></div><div class="stat"><span>رسائل العملاء</span><strong>${messages.length}</strong></div></div><h2>أحدث الطلبات</h2>${renderOrders([...orders].reverse().slice(0, 5))}`;
  } else if (tab === 'products') {
    $('#admin-content').innerHTML = `<h2>المنتجات (${products.length})</h2><div class="table-wrap"><table><thead><tr><th>المنتج</th><th>الفئة</th><th>السعر</th><th>الحالة</th></tr></thead><tbody>${products.map((item) => `<tr><td>${item.name}</td><td>${item.category}</td><td>${price(item.price)}</td><td><span class="pill">متاح</span></td></tr>`).join('')}</tbody></table></div>`;
  } else if (tab === 'orders') {
    $('#admin-content').innerHTML = `<h2>الطلبات (${orders.length})</h2>${renderOrders([...orders].reverse())}`;
  } else {
    $('#admin-content').innerHTML = `<h2>رسائل العملاء (${messages.length})</h2>${messages.length ? `<div class="table-wrap"><table><thead><tr><th>الرسالة</th><th>الوقت</th></tr></thead><tbody>${messages.map((message) => `<tr><td>${escapeHTML(message.text)}</td><td>${escapeHTML(message.time)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="table-wrap admin-empty">لسه مفيش رسائل محفوظة.</div>'}`;
  }
}

function sendMessage(text) {
  const message = text.trim();
  if (!message) return;
  const messagesBox = $('#messages');
  const bubble = document.createElement('p');
  bubble.className = 'customer';
  bubble.textContent = message;
  messagesBox.append(bubble);
  const stored = readStore('rasiMessages', []);
  stored.push({ text: message, time: new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' }).format(new Date()) });
  localStorage.setItem('rasiMessages', JSON.stringify(stored));
  $('#chat-input').value = '';
  messagesBox.scrollTop = messagesBox.scrollHeight;
  setTimeout(() => {
    const reply = document.createElement('p');
    reply.className = 'staff';
    reply.textContent = message.includes('استبدال') ? 'تقدري تطلبي الاستبدال خلال ١٤ يوم من استلام الطلب، بشرط القطعة تكون بحالتها الأصلية.' : message.includes('طلب') ? 'اكتبي رقم الطلب في رسالة تانية وفريقنا هيساعدك. (محادثة تجريبية)' : 'شكرًا لرسالتك! فريق RASI هيرد عليكي قريب. (رد تجريبي)';
    messagesBox.append(reply);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }, 450);
}

renderProducts();
renderCart();
route(['login', 'admin'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home');

document.addEventListener('click', (event) => {
  const target = event.target.closest('button,a,[data-product]');
  if (!target) return;
  if (target.dataset.page) { event.preventDefault(); route(target.dataset.page); return; }
  if (target.dataset.scroll) { event.preventDefault(); route('home'); setTimeout(() => document.getElementById(target.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' }), 35); return; }
  if (target.dataset.category) { setCategory(target.dataset.category); return; }
  if (target.dataset.add) { addToCart(Number(target.dataset.add)); return; }
  if (target.dataset.favorite) {
    const id = Number(target.dataset.favorite);
    favorites = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    localStorage.setItem('rasiFavorites', JSON.stringify(favorites));
    renderProducts();
    return;
  }
  if (target.dataset.product) {
    const item = products.find((product) => product.id === Number(target.dataset.product));
    if (item) {
      $('#product-detail').innerHTML = `<div class="detail"><img src="${item.image}" alt="${item.name}"><div class="detail-copy"><p class="eyebrow">${item.tag}</p><h2>${item.name}</h2><strong class="detail-price">${price(item.price)}</strong><p>قطعة عملية بخامة مريحة وقصة سهلة تنسقيها بطريقتك. اختاري المقاس المناسب ليكي.</p><label for="size">المقاس</label><select id="size"><option>اختاري المقاس</option><option>Small</option><option>Medium</option><option>Large</option><option>Extra Large</option></select><button class="button dark" data-add="${item.id}">أضيفي للسلة ←</button></div></div>`;
      $('#product-dialog').showModal();
    }
    return;
  }
  if (target.id === 'cart-open') openCart();
  if (['cart-close', 'continue'].includes(target.id)) closeCart();
  if (target.dataset.remove) { cart = cart.filter((item) => item.id !== Number(target.dataset.remove)); localStorage.setItem('rasiCart', JSON.stringify(cart)); renderCart(); }
  if (target.dataset.change) {
    const item = cart.find((row) => row.id === Number(target.dataset.id));
    if (item) item.quantity += Number(target.dataset.change);
    cart = cart.filter((row) => row.quantity > 0);
    localStorage.setItem('rasiCart', JSON.stringify(cart));
    renderCart();
  }
  if (target.id === 'checkout' && cart.length) {
    const total = cart.reduce((sum, row) => sum + (products.find((item) => item.id === row.id)?.price ?? 0) * row.quantity, 0);
    const orders = readStore('rasiOrders', []);
    orders.push({ id: `R-${String(Date.now()).slice(-6)}`, count: cart.reduce((sum, row) => sum + row.quantity, 0), total, status: 'قيد التجهيز' });
    localStorage.setItem('rasiOrders', JSON.stringify(orders));
    cart = [];
    localStorage.setItem('rasiCart', JSON.stringify(cart));
    renderCart(); closeCart(); toast('تم تسجيل طلب تجريبي بنجاح');
  }
  if (target.id === 'backdrop') closeCart();
  if (target.id === 'dialog-close') $('#product-dialog').close();
  if (target.dataset.tab) renderAdmin(target.dataset.tab);
  if (target.id === 'demo-admin') { localStorage.setItem('rasiAdmin', 'demo'); route('admin'); toast('أهلاً بيكي في لوحة الإدارة التجريبية'); }
  if (target.id === 'logout') { localStorage.removeItem('rasiAdmin'); route('home'); toast('تم تسجيل الخروج'); }
  if (target.id === 'search-toggle') { const form = $('#search-form'); form.hidden = !form.hidden; if (!form.hidden) $('#search').focus(); }
  if (target.id === 'menu-toggle') $('#nav').classList.toggle('open');
  if (target.id === 'chat-toggle') { $('#chat-panel').hidden = !$('#chat-panel').hidden; if (!$('#chat-panel').hidden) $('#chat-input').focus(); }
  if (target.id === 'chat-close') $('#chat-panel').hidden = true;
  if (target.dataset.reply) sendMessage(target.dataset.reply);
});

$('#products').addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-product]')) {
    event.preventDefault();
    event.target.click();
  }
});
$('#search').addEventListener('input', (event) => { query = event.target.value; renderProducts(); });
$('#search-form').addEventListener('submit', (event) => { event.preventDefault(); $('#shop').scrollIntoView({ behavior: 'smooth' }); });
$('#sort').addEventListener('change', renderProducts);
$('#backdrop').addEventListener('click', closeCart);
$('#product-dialog').addEventListener('click', (event) => { if (event.target === $('#product-dialog')) $('#product-dialog').close(); });
$('#chat-form').addEventListener('submit', (event) => { event.preventDefault(); sendMessage($('#chat-input').value); });
$('#login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = $('#email').value.trim();
  if (email === 'admin@rasi.com' && $('#password').value === 'rasi123') {
    localStorage.setItem('rasiAdmin', 'demo'); route('admin'); toast('تم تسجيل الدخول التجريبي');
  } else {
    localStorage.setItem('rasiCustomer', email); route('home'); toast('أهلاً بيكي! تم تسجيل الدخول التجريبي');
  }
});
