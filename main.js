document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search-bar input");
  const searchBtn = document.querySelector(".search-bar button");
  const products = document.querySelectorAll(".products .product");
  const userButtonsDiv = document.querySelector(".user-buttons");
  const modal = document.getElementById("orderModal");
  const closeBtn = modal ? modal.querySelector(".close-btn") : null;
  const orderForm = document.getElementById("orderForm");
  const productInput = document.getElementById("product");
  const addToCartButtons = document.querySelectorAll(".order-btn");
  const productCheckboxes = document.querySelectorAll(".product input.select-product");
  const cartItemsUl = document.getElementById("cartItems");
  const totalPriceSpan = document.getElementById("totalPrice");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // Modal chi tiết sản phẩm
  const productDetailModal = document.getElementById("productDetailModal");
  const closeDetailBtn = productDetailModal ? productDetailModal.querySelector(".close-detail-btn") : null;
  const detailProductName = document.getElementById("detailProductName");
  const detailProductImage = document.getElementById("detailProductImage");
  const detailProductPrice = document.getElementById("detailProductPrice");
  const detailProductDescription = document.getElementById("detailProductDescription");

  const productDetails = {
    "iPhone 13 Pro": {
      price: "20.000.000đ",
      image: "./anh/ip13.jpg",
      description: "iPhone 13 Pro với màn hình Super Retina XDR, chip A15 Bionic, camera chuyên nghiệp, hiệu năng mạnh mẽ."
    },
    "Samsung Galaxy S22": {
      price: "18.000.000đ",
      image: "./anh/s22.jpg",
      description: "Samsung Galaxy S22 với màn hình Dynamic AMOLED 2X, camera đa năng, pin lâu dài, hỗ trợ 5G."
    },
    "Xiaomi Mi 12": {
      price: "12.000.000đ",
      image: "./anh/xiaomi.jpg",
      description: "Xiaomi Mi 12 hiệu năng cao, camera chất lượng, thiết kế hiện đại, giá cạnh tranh."
    },
    "Oppo Find X5": {
      price: "15.000.000đ",
      image: "./anh/oppo.jpg",
      description: "Oppo Find X5 với camera Hasselblad, chip Snapdragon 888, sạc nhanh 80W."
    },
    "Realme GT 2": {
      price: "11.000.000đ",
      image: "./anh/readme.jpg",
      description: "Realme GT 2: Mạnh mẽ, giá tốt, màn hình AMOLED 120Hz, pin 5000mAh."
    },
    "Vivo X80": {
      price: "14.000.000đ",
      image: "./anh/vivo.webp",
      description: "Vivo X80 với camera Zeiss, chip Snapdragon 8 Gen 1, thiết kế sang trọng."
    },
    "Iphone 11": {
      price: "10.650.000 ₫",
      image: "./anh/ip11.jpg",
      description: "iPhone 11 Pro Max cũ, hiệu năng ổn định, màn hình Liquid Retina, camera kép."
    }
  };

  let cart = [];

  // 1. Tìm kiếm sản phẩm
  function filterProducts() {
    const keyword = searchInput.value.trim().toLowerCase();
    products.forEach(product => {
      const name = product.querySelector("h3").textContent.toLowerCase();
      product.style.display = name.includes(keyword) ? "block" : "none";
    });
  }
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", filterProducts);
    searchInput.addEventListener("keypress", e => {
      if (e.key === "Enter") filterProducts();
    });
  }

  // 2. Kiểm tra trạng thái đăng nhập, cập nhật giao diện
  function checkLoginStatus() {
    const email = sessionStorage.getItem("userEmail");
    const name = sessionStorage.getItem("userName");
    if (email && userButtonsDiv) {
      userButtonsDiv.innerHTML = `
        <span class="username">👋 Xin chào, ${name || email.split("@")[0]}</span>
        <button class="logout-btn">Đăng xuất</button>
      `;

      userButtonsDiv.querySelector(".logout-btn").onclick = () => {
        sessionStorage.removeItem("userEmail");
        sessionStorage.removeItem("userName");
        checkLoginStatus();
      };
    } else if (userButtonsDiv) {
      userButtonsDiv.innerHTML = `
        <button class="login-btn"><i class="fas fa-user"></i> Đăng nhập</button>
        <button class="register-btn"><i class="fas fa-user-plus"></i> Đăng ký</button>
      `;
      userButtonsDiv.querySelector(".login-btn").onclick = showLoginForm;
      userButtonsDiv.querySelector(".register-btn").onclick = showRegisterForm;
    }
  }

  // 3. Yêu cầu đăng nhập trước thao tác
  function requireLogin(callback) {
    const email = sessionStorage.getItem("userEmail");
    if (!email) {
      alert("Vui lòng đăng nhập để tiếp tục.");
      showLoginForm();
      return false;
    }
    callback();
    return true;
  }

  // 4. Cập nhật giỏ hàng khi chọn checkbox sản phẩm
  productCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const productDiv = checkbox.closest(".product");
      if (!productDiv) return;

      const name = productDiv.querySelector("h3").textContent;
      const priceStr = productDiv.querySelector("p strong").textContent;
      const price = Number(priceStr.replace(/\D/g, ""));

      if (checkbox.checked) {
        if (!cart.find(p => p.name === name)) {
          cart.push({ name, price });
        }
      } else {
        cart = cart.filter(p => p.name !== name);
      }
      updateCartUI();
    });
  });

  // 5. Cập nhật giao diện giỏ hàng
  function updateCartUI() {
    if (!cartItemsUl || !totalPriceSpan || !checkoutBtn) return;
    cartItemsUl.innerHTML = "";
    if (cart.length === 0) {
      cartItemsUl.innerHTML = "<li>Chưa có sản phẩm nào trong giỏ.</li>";
      checkoutBtn.disabled = true;
      totalPriceSpan.textContent = "0đ";
      return;
    }
    cart.forEach(({ name, price }) => {
      const li = document.createElement("li");
      li.textContent = `${name} - ${price.toLocaleString("vi-VN")}đ`;
      cartItemsUl.appendChild(li);
    });
    const total = cart.reduce((sum, p) => sum + p.price, 0);
    totalPriceSpan.textContent = total.toLocaleString("vi-VN") + "đ";
    checkoutBtn.disabled = false;
  }
  updateCartUI();

  // 6. Mua ngay mở popup đặt hàng với sản phẩm đơn lẻ
  addToCartButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      requireLogin(() => {
        const productDiv = btn.closest(".product");
        if (!productDiv) return;
        const name = productDiv.querySelector("h3").textContent;
        if (productInput) productInput.value = name;
        if (modal) modal.style.display = "flex";
      });
    });
  });

  // 7. Nút Thanh toán mở popup đặt hàng với toàn bộ sản phẩm trong giỏ
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      requireLogin(() => {
        if (cart.length === 0) {
          alert("Giỏ hàng của bạn đang trống!");
          return;
        }
        const productNames = cart.map(p => p.name).join(", ");
        if (productInput) productInput.value = productNames;
        if (modal) modal.style.display = "flex";
      });
    });
  }

  // 8. Đóng popup đặt hàng
  if (closeBtn && modal && orderForm) {
    closeBtn.onclick = () => {
      modal.style.display = "none";
      orderForm.reset();
    };
    window.onclick = e => {
      if (e.target === modal) {
        modal.style.display = "none";
        orderForm.reset();
      }
    };
    window.onkeydown = e => {
      if (e.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
        orderForm.reset();
      }
    };
  }

  // 9. Gửi form đặt hàng
  if (orderForm) {
    orderForm.addEventListener("submit", e => {
      e.preventDefault();

      const formData = new FormData(orderForm);

      fetch(orderForm.action, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      })
        .then(response => {
          if (response.ok) {
            alert(`Cảm ơn ${orderForm.name.value}! Đơn hàng "${orderForm.product.value}" đã được ghi nhận.`);
            if (modal) modal.style.display = "none";
            orderForm.reset();
            cart = [];
            productCheckboxes.forEach(cb => (cb.checked = false));
            updateCartUI();
          } else {
            alert("Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại.");
          }
        })
        .catch(() => {
          alert("Lỗi kết nối. Vui lòng thử lại sau.");
        });
    });
  }

  // 10. Hiện popup đăng nhập
  function showLoginForm() {
    if (document.querySelector(".popup-overlay")) return;
    const html = `
      <div style="background:white; padding:20px; border-radius:6px; width:300px; position:relative;">
        <h2>Đăng nhập</h2>
        <form id="loginForm">
          <input type="email" placeholder="Email" required style="width:100%;margin-bottom:10px;padding:8px;" />
          <input type="password" placeholder="Mật khẩu" required style="width:100%;margin-bottom:10px;padding:8px;" />
          <button type="submit" style="width:100%; padding:10px; background:#b30000; color:white;">Đăng nhập</button>
        </form>
        <button id="closeLogin" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:20px;">×</button>
      </div>
    `;
    const popup = document.createElement("div");
    popup.className = "popup-overlay";
    popup.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:10000;";
    popup.innerHTML = html;
    document.body.appendChild(popup);

    popup.querySelector("#closeLogin").onclick = () => popup.remove();

    popup.querySelector("#loginForm").onsubmit = e => {
      e.preventDefault();
      const email = e.target[0].value;
      const name = email.split("@")[0]; // Tạm dùng phần trước @ làm tên
      sessionStorage.setItem("userEmail", email);
      sessionStorage.setItem("userName", name);
      alert("Đăng nhập thành công!");
      popup.remove();
      checkLoginStatus();
    };
  }

  // 11. Hiện popup đăng ký
  function showRegisterForm() {
    if (document.querySelector(".popup-overlay")) return;
    const html = `
      <div style="background:white; padding:20px; border-radius:6px; width:300px; position:relative;">
        <h2>Đăng ký</h2>
        <form id="registerForm">
          <input type="text" placeholder="Họ tên" required style="width:100%;margin-bottom:10px;padding:8px;" />
          <input type="email" placeholder="Email" required style="width:100%;margin-bottom:10px;padding:8px;" />
          <input type="password" placeholder="Mật khẩu" required style="width:100%;margin-bottom:10px;padding:8px;" />
          <input type="password" placeholder="Nhập lại mật khẩu" required style="width:100%;margin-bottom:10px;padding:8px;" />
          <button type="submit" style="width:100%; padding:10px; background:#b30000; color:white;">Đăng ký</button>
        </form>
        <button id="closeRegister" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:20px;">×</button>
      </div>
    `;
    const popup = document.createElement("div");
    popup.className = "popup-overlay";
    popup.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:10000;";
    popup.innerHTML = html;
    document.body.appendChild(popup);

    popup.querySelector("#closeRegister").onclick = () => popup.remove();

    popup.querySelector("#registerForm").onsubmit = e => {
      e.preventDefault();
      const inputs = e.target.querySelectorAll("input");
      const name = inputs[0].value.trim();
      const email = inputs[1].value.trim();
      const pass = inputs[2].value.trim();
      const pass2 = inputs[3].value.trim();
      if (pass !== pass2) {
        alert("Mật khẩu không khớp!");
        return;
      }
      sessionStorage.setItem("userName", name);
      sessionStorage.setItem("userEmail", email);
      alert(`Đăng ký thành công! Chào mừng ${name}`);
      popup.remove();
      checkLoginStatus();
    };
  }

  // 12. Ẩn hiện giỏ hàng khi scroll
  function toggleCart() {
    const cart = document.getElementById("cart");
    if (cart) cart.classList.toggle("collapsed");
  }

  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    const cart = document.getElementById("cart");
    if (!cart) return;
    if (window.scrollY > lastScrollY) {
      cart.classList.add("collapsed");
    } else {
      cart.classList.remove("collapsed");
    }
    lastScrollY = window.scrollY;
  });

  checkLoginStatus();

  // 13. Xử lý mở modal chi tiết sản phẩm khi click vào tên hoặc ảnh sản phẩm
  products.forEach(productDiv => {
    const btnOrder = productDiv.querySelector(".order-btn");
    const title = productDiv.querySelector("h3");
    const image = productDiv.querySelector("img");

    function openDetailModal() {
      const productName = title.textContent.trim();
      const detail = productDetails[productName];
      if (!detail) {
        alert("Chưa có thông tin chi tiết cho sản phẩm này.");
        return;
      }
      if (!productDetailModal) return;

      detailProductName.textContent = productName;
      detailProductImage.src = detail.image;
      detailProductImage.alt = productName;
      detailProductPrice.textContent = "Giá: " + detail.price;
      detailProductDescription.textContent = detail.description;
      productDetailModal.style.display = "flex";
    }

    if (title) title.style.cursor = "pointer";
    if (image) image.style.cursor = "pointer";

    if (title) title.addEventListener("click", openDetailModal);
    if (image) image.addEventListener("click", openDetailModal);

    // Nút mua đã xử lý ở trên rồi
  });

  // Đóng modal chi tiết sản phẩm
  if (closeDetailBtn && productDetailModal) {
    closeDetailBtn.addEventListener("click", () => {
      productDetailModal.style.display = "none";
    });
    window.addEventListener("click", event => {
      if (event.target === productDetailModal) {
        productDetailModal.style.display = "none";
      }
    });
  }
});
products.forEach(productDiv => {
  const title = productDiv.querySelector("h3");
  const image = productDiv.querySelector("img");

  function openDetailModal() {
    const productName = title.textContent.trim();
    const detail = productDetails[productName];
    if (!detail) {
      alert("Chưa có thông tin chi tiết cho sản phẩm này.");
      return;
    }
    if (!productDetailModal) return;

    detailProductName.textContent = productName;
    detailProductImage.src = detail.image;
    detailProductImage.alt = productName;
    detailProductPrice.textContent = "Giá: " + detail.price;
    detailProductDescription.textContent = detail.description;
    productDetailModal.style.display = "flex";
  }

  if (title) {
    title.style.cursor = "pointer";       // con trỏ chuột thay đổi khi hover
    title.addEventListener("click", openDetailModal);
  }
  if (image) {
    image.style.cursor = "pointer";
    image.addEventListener("click", openDetailModal);
  }
});
