import { useState, useEffect } from "react";
import "./App.css";

// ==========================================
// 1. Component: شريط التنقل (Navbar)
// ==========================================
function Navbar({ cartCount, onOpenCart, searchQuery, setSearchQuery }) {
  return (
    <header className="navbar">
      <div className="container nav-content">
        <div className="brand">
          <span className="brand-icon">🛍️</span>
          <h1>سوق<span>بلس</span></h1>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="cart-trigger-btn" onClick={onOpenCart}>
          <span>السلة 🛒</span>
          <span className="cart-badge">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

// ==========================================
// 2. Component: فلتر الأقسام (CategoryFilter)
// ==========================================
function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="categories-bar">
      <button
        className={`cat-btn ${selectedCategory === "all" ? "active" : ""}`}
        onClick={() => onSelectCategory("all")}
      >
        كل المنتجات
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`cat-btn ${selectedCategory === cat ? "active" : ""}`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// ==========================================
// 3. Component: كارت المنتج (ProductCard)
// ==========================================
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="img-wrapper">
        <span className="category-tag">{product.category}</span>
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <div className="product-meta">
          <span className="rating">⭐ {product.rating}</span>
          <span className="price">${product.price}</span>
        </div>

        <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>
          إضافة إلى السلة +
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 4. Component: سلة المشتريات الجانبية (CartSidebar)
// ==========================================
function CartSidebar({ isOpen, onClose, cart, onUpdateQty, onRemove, onClearCart }) {
  if (!isOpen) return null;

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>سلة المشتريات 🛒</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>سلة المشتريات فارغة حالياً</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.thumbnail} alt={item.title} />
                  <div className="cart-item-info">
                    <h4>{item.title}</h4>
                    <p>${(item.price * item.qty).toFixed(2)}</p>
                    <div className="qty-controls">
                      <button onClick={() => onUpdateQty(item.id, -1)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => onUpdateQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                  <button className="remove-item-btn" onClick={() => onRemove(item.id)}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="total-row">
                <span>الإجمالي:</span>
                <strong>${totalPrice.toFixed(2)}</strong>
              </div>
              <button
                className="checkout-btn"
                onClick={() => {
                  alert("تم تأكيد طلبك بنجاح! 🎉");
                  onClearCart();
                  onClose();
                }}
              >
                إتمام الشراء الآن
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// ==========================================
// 5. المكون الرئيسي (Main App Component)
// ==========================================
export default function App() {
  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // جلب المنتجات من API حقيقي عند تشغيل التطبيق
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("https://dummyjson.com/products?limit=16");
        if (!res.ok) throw new Error("فشل في تحميل المنتجات");
        const data = await res.json();
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // استخراج الأقسام بدون تكرار
  const categories = [...new Set(products.map((p) => p.category))];

  // فلترة المنتجات حسب القسم والبحث
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // إضافة منتج للسلة
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  // تعديل الكمية (+ أو -)
  const handleUpdateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // حذف منتج من السلة
  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // إجمالي عدد القطع في السلة
  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="app-wrapper">
      <Navbar
        cartCount={totalCartItems}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="container main-content">
        <section className="store-banner">
          <h2>أحدث المنتجات العالمية بأفضل الأسعار 🔥</h2>
          <p>تصفح، فلتر، وأضف منتجاتك المفضلة إلى سلة التسوق</p>
        </section>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading && <div className="status-msg">جاري تحميل المنتجات من الـ API... ⏳</div>}
        {error && <div className="status-msg error">{error}</div>}

        {!loading && !error && (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemoveFromCart}
        onClearCart={() => setCart([])}
      />
    </div>
  );
}