document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search-bar input");
  const searchBtn = document.querySelector(".search-bar button");
  const products = document.querySelectorAll(".products .product");
  const userButtonsDiv = document.querySelector(".user-buttons");
  const modal = document.getElementById("orderModal");
  const closeBtn = modal.querySelector(".close-btn");
  const orderForm = document.getElementById("orderForm");
  const productInput = document.getElementById("product");
  const addToCartButtons = document.querySelectorAll(".order-btn");
  const productCheckboxes = document.querySelectorAll(".product input.select-product");
  const cartItemsUl = document.getElementById("cartItems");
  const totalPriceSpan = document.getElementById("totalPrice");
  const checkoutBtn = document.getElementById("checkoutBtn");

  let cart = [];

  // 1. Tìm kiếm sản phẩm
  function filterProducts() {
    const keyword = searchInput.value.trim().toLowerCase();
    products.forEach(product => {
      const name = product.querySelector("h3").textContent.toLowerCase();
      product.style.display = name.includes(keyword) ? "block" : "none";
    });
  }
  searchBtn.addEventListener("click", filterProducts);
  searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") filterProducts();
  });

  // 2. Kiểm tra trạng thái đăng nhập, cập nhật giao diện
  function checkLoginStatus() {
    const email = sessionStorage.getItem("userEmail");
    if (email && userButtonsDiv) {
      userButtonsDiv.innerHTML = `
        <span style="color:#b30000; font-weight:600; margin-right:10px;">
          Xin chào, ${email.split("@")[0]}
        </span>
        <button class="logout-btn" style="background:#b30000; color:#fff; border:none; padding:5px 10px;">Đăng xuất</button>
      `;
      userButtonsDiv.querySelector(".logout-btn").onclick = () => {
        sessionStorage.removeItem("userEmail");
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
        const name = productDiv.querySelector("h3").textContent;
        productInput.value = name;
        modal.style.display = "flex";
      });
    });
  });

  // 7. Xử lý nút Thanh toán mở popup đặt hàng với toàn bộ sản phẩm trong giỏ
  checkoutBtn.addEventListener("click", () => {
    requireLogin(() => {
      if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
      }
      const productNames = cart.map(p => p.name).join(", ");
      productInput.value = productNames;
      modal.style.display = "flex";
    });
  });

  // 8. Đóng popup đặt hàng
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

  // 9. Gửi form đặt hàng
 orderForm.addEventListener("submit", e => {
  e.preventDefault();

  const formData = new FormData(orderForm);

  fetch(orderForm.action, {
    method: "POST",
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      alert(`Cảm ơn ${orderForm.name.value}! Đơn hàng "${orderForm.product.value}" đã được ghi nhận.`);
      modal.style.display = "none";
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
      sessionStorage.setItem("userEmail", email);
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
      alert(`Đăng ký thành công! Chào mừng ${name}`);
      popup.remove();
    };
  }
function toggleCart() {
  document.getElementById("cart").classList.toggle("collapsed");
}
let lastScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const cart = document.getElementById("cart");
  if (window.scrollY > lastScrollY) {
    cart.classList.add("collapsed");
  } else {
    cart.classList.remove("collapsed");
  }
  lastScrollY = window.scrollY;
});

  checkLoginStatus();
});
