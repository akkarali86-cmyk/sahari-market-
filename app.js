/* =========================================================
   SAHARI MARKET
   APP.JS
========================================================= */

"use strict";

/* =========================================================
   APP STATE
========================================================= */

const AppState = {
  favorites: JSON.parse(
    localStorage.getItem("sahari_favorites") || "[]"
  ),

  darkMode:
    localStorage.getItem("sahari_dark_mode") === "true",

  currentPage: "home"
};


/* =========================================================
   ELEMENTS
========================================================= */

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const modalOverlay = document.getElementById("modalOverlay");

const searchInput =
  document.getElementById("searchInput");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  initializeDarkMode();

  initializeNavigation();

  initializeFavorites();

  initializeCategories();

  initializeSearch();

  initializeMainButtons();

  initializeModal();

});


/* =========================================================
   DARK MODE
========================================================= */

function initializeDarkMode() {

  if (AppState.darkMode) {
    document.body.classList.add("dark");
  }

}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

  const navItems =
    document.querySelectorAll(".nav-item");

  navItems.forEach(item => {

    item.addEventListener("click", () => {

      const page =
        item.dataset.page;

      if (!page) return;

      navItems.forEach(nav =>
        nav.classList.remove("active")
      );

      if (
        page !== "create"
      ) {
        item.classList.add("active");
      }

      handleNavigation(page);

    });

  });

}


function handleNavigation(page) {

  AppState.currentPage = page;

  switch (page) {

    case "home":

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      break;


    case "search":

      searchInput.focus();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      break;


    case "create":

      openCreateMenu();

      break;


    case "favorites":

      openFavorites();

      break;


    case "profile":

      openProfile();

      break;

  }

}


/* =========================================================
   FAVORITES
========================================================= */

function initializeFavorites() {

  const buttons =
    document.querySelectorAll(".favorite-btn");

  buttons.forEach((button, index) => {

    const id =
      `business-${index}`;

    if (
      AppState.favorites.includes(id)
    ) {
      button.classList.add("liked");
      button.textContent = "♥";
    }

    button.addEventListener("click", () => {

      toggleFavorite(id, button);

    });

  });

}


function toggleFavorite(id, button) {

  const index =
    AppState.favorites.indexOf(id);

  if (index === -1) {

    AppState.favorites.push(id);

    button.classList.add("liked");

    button.textContent = "♥";

    showToast("تمت الإضافة إلى المفضلة ❤️");

  } else {

    AppState.favorites.splice(index, 1);

    button.classList.remove("liked");

    button.textContent = "♡";

    showToast("تمت إزالة العنصر من المفضلة");

  }

  localStorage.setItem(
    "sahari_favorites",
    JSON.stringify(AppState.favorites)
  );

}


/* =========================================================
   CATEGORIES
========================================================= */

function initializeCategories() {

  const categories =
    document.querySelectorAll(".category-card");

  categories.forEach(category => {

    category.addEventListener("click", () => {

      const name =
        category.querySelector("span")
          ?.textContent || "التصنيف";

      showCategory(name);

    });

  });

}


function showCategory(name) {

  openModal(`
  
    <h2 class="modal-title">
      ${escapeHTML(name)}
    </h2>

    <p class="modal-text">
      سنعرض هنا المنتجات والمحلات والخدمات الخاصة
      بهذا التصنيف.
    </p>

    <div class="modal-option">

      <div class="modal-option-icon">
        🛍️
      </div>

      <div>
        <strong>المنتجات</strong>
        <small>
          اكتشف المنتجات الموجودة في منطقتك
        </small>
      </div>

    </div>

    <div class="modal-option">

      <div class="modal-option-icon">
        🏪
      </div>

      <div>
        <strong>المحلات</strong>
        <small>
          اكتشف المحلات القريبة منك
        </small>
      </div>

    </div>

    <div class="modal-option">

      <div class="modal-option-icon">
        🔧
      </div>

      <div>
        <strong>الخدمات</strong>
        <small>
          ابحث عن مقدمي الخدمات
        </small>
      </div>

    </div>

  `);

}


/* =========================================================
   SEARCH
========================================================= */

function initializeSearch() {

  if (!searchInput) return;

  searchInput.addEventListener(
    "input",
    handleSearch
  );

}


function handleSearch() {

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  const cards =
    document.querySelectorAll(
      ".business-card"
    );

  let found = false;

  cards.forEach(card => {

    const text =
      card.textContent
        .toLowerCase();

    if (
      !query ||
      text.includes(query)
    ) {

      card.style.display = "flex";

      if (query) {
        found = true;
      }

    } else {

      card.style.display = "none";

    }

  });

  let result =
    document.getElementById(
      "searchResultMessage"
    );

  if (!result) {

    result =
      document.createElement("div");

    result.id =
      "searchResultMessage";

    result.className =
      "search-empty";

    const list =
      document.getElementById(
        "businessList"
      );

    list.parentNode.insertBefore(
      result,
      list
    );

  }

  if (query && !found) {

    result.innerHTML = `
      <div>🔎</div>
      <p>
        لم نجد نتائج مطابقة لـ
        "<strong>${escapeHTML(query)}</strong>"
      </p>
    `;

    result.style.display = "block";

  } else {

    result.style.display = "none";

  }

}


/* =========================================================
   MAIN BUTTONS
========================================================= */

function initializeMainButtons() {

  const buyerBtn =
    document.getElementById("buyerBtn");

  const sellerBtn =
    document.getElementById("sellerBtn");

  const exploreBtn =
    document.getElementById("exploreBtn");

  const nearbyBtn =
    document.getElementById("nearbyBtn");

  const postsBtn =
    document.getElementById("postsBtn");

  const allCategoriesBtn =
    document.getElementById(
      "allCategoriesBtn"
    );

  const changeLocationBtn =
    document.getElementById(
      "changeLocationBtn"
    );

  const notificationBtn =
    document.getElementById(
      "notificationBtn"
    );


  if (buyerBtn) {

    buyerBtn.addEventListener(
      "click",
      openBuyerMenu
    );

  }


  if (sellerBtn) {

    sellerBtn.addEventListener(
      "click",
      openSellerMenu
    );

  }


  if (exploreBtn) {

    exploreBtn.addEventListener(
      "click",
      () => {

        document.querySelector(
          ".section"
        )?.scrollIntoView({
          behavior: "smooth"
        });

      }
    );

  }


  if (nearbyBtn) {

    nearbyBtn.addEventListener(
      "click",
      openNearby
    );

  }


  if (postsBtn) {

    postsBtn.addEventListener(
      "click",
      openPosts
    );

  }


  if (allCategoriesBtn) {

    allCategoriesBtn.addEventListener(
      "click",
      openAllCategories
    );

  }


  if (changeLocationBtn) {

    changeLocationBtn.addEventListener(
      "click",
      openLocation
    );

  }


  if (notificationBtn) {

    notificationBtn.addEventListener(
      "click",
      openNotifications
    );

  }

}


/* =========================================================
   BUYER MENU
========================================================= */

function openBuyerMenu() {

  openModal(`

    <h2 class="modal-title">
      🛍️ ماذا تريد؟
    </h2>

    <p class="modal-text">
      ابحث عن المنتجات والمحلات والخدمات القريبة منك.
    </p>


    <button class="modal-option"
      onclick="buyerAction('products')">

      <div class="modal-option-icon">
        📦
      </div>

      <div>
        <strong>المنتجات</strong>
        <small>
          الملابس، الإلكترونيات، المواد الغذائية وغيرها
        </small>
      </div>

    </button>


    <button class="modal-option"
      onclick="buyerAction('shops')">

      <div class="modal-option-icon">
        🏪
      </div>

      <div>
        <strong>المحلات</strong>
        <small>
          اكتشف المتاجر القريبة منك
        </small>
      </div>

    </button>


    <button class="modal-option"
      onclick="buyerAction('services')">

      <div class="modal-option-icon">
        🔧
      </div>

      <div>
        <strong>الخدمات</strong>
        <small>
          ابحث عن الأشخاص ومقدمي الخدمات
        </small>
      </div>

    </button>

  `);

}


function buyerAction(type) {

  closeModalWindow();

  if (type === "products") {

    showToast("قسم المنتجات قادم في المرحلة التالية 📦");

  }

  if (type === "shops") {

    showToast("قسم المحلات قادم في المرحلة التالية 🏪");

  }

  if (type === "services") {

    showToast("قسم الخدمات قادم في المرحلة التالية 🔧");

  }

}


/* =========================================================
   SELLER MENU
========================================================= */

function openSellerMenu() {

  openModal(`

    <h2 class="modal-title">
      🏪 افتح نشاطك
    </h2>

    <p class="modal-text">
      اختر نوع النشاط الذي تريد إنشاءه.
    </p>


    <button class="modal-option"
      onclick="sellerAction('store')">

      <div class="modal-option-icon">
        🏪
      </div>

      <div>
        <strong>متجر</strong>
        <small>
          بيع المنتجات عبر سوق الصحاري
        </small>
      </div>

    </button>


    <button class="modal-option"
      onclick="sellerAction('service')">

      <div class="modal-option-icon">
        🔧
      </div>

      <div>
        <strong>خدمة</strong>
        <small>
          قدم خدماتك للعملاء
        </small>
      </div>

    </button>


    <button class="modal-option"
      onclick="sellerAction('restaurant')">

      <div class="modal-option-icon">
        🍔
      </div>

      <div>
        <strong>مطعم / مأكولات</strong>
        <small>
          اعرض الوجبات والعروض
        </small>
      </div>

    </button>


    <button class="modal-option"
      onclick="sellerAction('transport')">

      <div class="modal-option-icon">
        🚕
      </div>

      <div>
        <strong>نقل</strong>
        <small>
          سيارات، توصيل، نقل أشخاص أو بضائع
        </small>
      </div>

    </button>


    <button class="modal-option"
      onclick="sellerAction('freelancer')">

      <div class="modal-option-icon">
        💼
      </div>

      <div>
        <strong>مستقل</strong>
        <small>
          اعرض مهاراتك وخدماتك
        </small>
      </div>

    </button>

  `);

}


function sellerAction(type) {

  closeModalWindow();

  const names = {

    store: "متجر",
    service: "خدمة",
    restaurant: "مطعم / مأكولات",
    transport: "نقل",
    freelancer: "مستقل"

  };

  showToast(
    `سيتم إنشاء نشاط: ${names[type]} 🏪`
  );

}


/* =========================================================
   CREATE MENU
========================================================= */

function openCreateMenu() {

  openModal(`

    <h2 class="modal-title">
      ＋ إنشاء
    </h2>

    <p class="modal-text">
      ماذا تريد أن تنشئ؟
    </p>


    <button class="modal-option"
      onclick="createAction('post')">

      <div class="modal-option-icon">
        📝
      </div>

      <div>
        <strong>منشور</strong>
        <small>
          شارك شيئًا مع مجتمع سوق الصحاري
        </small>
      </div>

    </button>


    <button class="modal-option"
      onclick="createAction('store')">

      <div class="modal-option-icon">
        🏪
      </div>

      <div>
        <strong>نشاط تجاري</strong>
        <small>
          افتح متجرًا أو خدمة
        </small>
      </div>

    </button>


    <button class="modal-option"
      onclick="createAction('product')">

      <div class="modal-option-icon">
        📦
      </div>

      <div>
        <strong>منتج</strong>
        <small>
          أضف منتجًا لنشاطك
        </small>
      </div>

    </button>

  `);

}


function createAction(type) {

  closeModalWindow();

  const names = {

    post: "منشور",
    store: "نشاط تجاري",
    product: "منتج"

  };

  showToast(
    `إنشاء ${names[type]} سيكون متاحًا مع نظام الحسابات 🚀`
  );

}


/* =========================================================
   FAVORITES PAGE
========================================================= */

function openFavorites() {

  openModal(`

    <h2 class="modal-title">
      ❤️ المفضلة
    </h2>

    <p class="modal-text">

      هنا ستجد المحلات والمنتجات والخدمات
      التي قمت بحفظها.

    </p>

    <div class="search-empty">

      <div>❤️</div>

      <p>
        عدد العناصر المحفوظة:
        <strong>
          ${AppState.favorites.length}
        </strong>
      </p>

    </div>

  `);

}


/* =========================================================
   PROFILE
========================================================= */

function openProfile() {

  openModal(`

    <h2 class="modal-title">
      👤 حسابي
    </h2>

    <p class="modal-text">
      أنشئ حسابك للوصول إلى جميع ميزات
      سوق الصحاري.
    </p>


    <button class="modal-option"
      onclick="profileAction('login')">

      <div class="modal-option-icon">
        🔐
      </div>

      <div>
        <strong>تسجيل الدخول</strong>
        <small>
          لديك حساب بالفعل؟
        </small>
      </div>

    </button>


    <button class="modal-option"
      onclick="profileAction('signup')">

      <div class="modal-option-icon">
        👤
      </div>

      <div>
        <strong>إنشاء حساب</strong>
        <small>
          أنشئ حسابًا جديدًا مجانًا
        </small>
      </div>

    </button>


    <button class="modal-option"
      onclick="toggleDarkMode()">

      <div class="modal-option-icon">
        🌙
      </div>

      <div>
        <strong>الوضع الليلي</strong>
        <small>
          تغيير مظهر التطبيق
        </small>
      </div>

    </button>

  `);

}


function profileAction(type) {

  closeModalWindow();

  if (type === "login") {

    showToast(
      "تسجيل الدخول سيتم ربطه بقاعدة البيانات لاحقًا 🔐"
    );

  }

  if (type === "signup") {

    showToast(
      "إنشاء الحساب سيتم ربطه بقاعدة البيانات لاحقًا 👤"
    );

  }

}


/* =========================================================
   DARK MODE TOGGLE
========================================================= */

function toggleDarkMode() {

  document.body.classList.toggle("dark");

  AppState.darkMode =
    document.body.classList.contains("dark");

  localStorage.setItem(
    "sahari_dark_mode",
    AppState.darkMode
  );

  showToast(
    AppState.darkMode
      ? "تم تشغيل الوضع الليلي 🌙"
      : "تم تشغيل الوضع النهاري ☀️"
  );

}


/* =========================================================
   NEARBY
========================================================= */

function openNearby() {

  openModal(`

    <h2 class="modal-title">
      📍 قريب منك
    </h2>

    <p class="modal-text">
      سيتم ترتيب المحلات والخدمات حسب المسافة
      من موقعك عندما نضيف نظام الموقع الحقيقي.
    </p>


    <button class="modal-option"
      onclick="requestLocation()">

      <div class="modal-option-icon">
        📍
      </div>

      <div>
        <strong>
          تحديد موقعي
        </strong>

        <small>
          السماح للتطبيق باستخدام موقعك
        </small>
      </div>

    </button>

  `);

}


function requestLocation() {

  if (!navigator.geolocation) {

    showToast(
      "المتصفح لا يدعم تحديد الموقع"
    );

    return;

  }

  navigator.geolocation.getCurrentPosition(

    position => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;

      closeModalWindow();

      showToast(
        `تم تحديد موقعك 📍`
      );

      console.log(
        "Location:",
        lat,
        lng
      );

    },

    () => {

      showToast(
        "لم نتمكن من تحديد موقعك"
      );

    }

  );

}


/* =========================================================
   LOCATION
========================================================= */

function openLocation() {

  openModal(`

    <h2 class="modal-title">
      📍 تغيير الموقع
    </h2>

    <p class="modal-text">
      اختر المنطقة التي تريد استكشافها.
    </p>


    <button class="modal-option"
      onclick="selectLocation('حد الصحاري')">

      <div class="modal-option-icon">
        📍
      </div>

      <div>
        <strong>حد الصحاري</strong>
        <small>الجلفة</small>
      </div>

    </button>


    <button class="modal-option"
      onclick="selectLocation('الجلفة')">

      <div class="modal-option-icon">
        📍
      </div>

      <div>
        <strong>مدينة الجلفة</strong>
        <small>ولاية الجلفة</small>
      </div>

    </button>


    <button class="modal-option"
      onclick="requestLocation()">

      <div class="modal-option-icon">
        📡
      </div>

      <div>
        <strong>استخدم موقعي الحالي</strong>
        <small>
          تحديد الموقع تلقائيًا
        </small>
      </div>

    </button>

  `);

}


function selectLocation(location) {

  const locationBar =
    document.querySelector(
      ".location-bar strong"
    );

  if (locationBar) {

    locationBar.textContent =
      location;

  }

  closeModalWindow();

  showToast(
    `تم تغيير الموقع إلى ${location} 📍`
  );

}


/* =========================================================
   POSTS
========================================================= */

function openPosts() {

  openModal(`

    <h2 class="modal-title">
      📝 المنشورات
    </h2>

    <p class="modal-text">
      اكتشف آخر العروض والمنشورات من المحلات
      ومقدمي الخدمات.
    </p>


    <div class="modal-option">

      <div class="modal-option-icon">
        🔥
      </div>

      <div>
        <strong>
          العروض الجديدة
        </strong>

        <small>
          اكتشف أفضل العروض القريبة منك
        </small>
      </div>

    </div>


    <div class="modal-option">

      <div class="modal-option-icon">
        🆕
      </div>

      <div>
        <strong>
          المنتجات الجديدة
        </strong>

        <small>
          شاهد ما وصل حديثًا
        </small>
      </div>

    </div>

  `);

}


/* =========================================================
   ALL CATEGORIES
========================================================= */

function openAllCategories() {

  const categories = [
    ["🛍️", "التسوق"],
    ["🍔", "المطاعم"],
    ["🔧", "الصيانة"],
    ["🚕", "النقل"],
    ["🏠", "المنزل"],
    ["💇", "الجمال"],
    ["🎓", "التعليم"],
    ["❤️", "الصحة"],
    ["🏢", "العقارات"],
    ["🚗", "السيارات"],
    ["💼", "الأعمال"],
    ["📱", "الإلكترونيات"]
  ];

  let html = `

    <h2 class="modal-title">
      جميع التصنيفات
    </h2>

    <p class="modal-text">
      اختر التصنيف الذي تريد استكشافه.
    </p>

  `;

  categories.forEach(category => {

    html += `

      <button class="modal-option"
        onclick="categoryFromAll('${escapeAttribute(category[1])}')">

        <div class="modal-option-icon">
          ${category[0]}
        </div>

        <div>
          <strong>
            ${escapeHTML(category[1])}
          </strong>

          <small>
            استكشف المنتجات والخدمات
          </small>
        </div>

      </button>

    `;

  });

  openModal(html);

}


function categoryFromAll(name) {

  closeModalWindow();

  showCategory(name);

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function openNotifications() {

  openModal(`

    <h2 class="modal-title">
      🔔 الإشعارات
    </h2>

    <div class="search-empty">

      <div>🔔</div>

      <p>
        لا توجد إشعارات جديدة حاليًا.
      </p>

    </div>

  `);

}


/* =========================================================
   MODAL SYSTEM
========================================================= */

function initializeModal() {

  if (closeModal) {

    closeModal.addEventListener(
      "click",
      closeModalWindow
    );

  }

  if (modalOverlay) {

    modalOverlay.addEventListener(
      "click",
      closeModalWindow
    );

  }

}


function openModal(content) {

  if (!modal || !modalBody) return;

  modalBody.innerHTML =
    content;

  modal.classList.add("show");

  document.body.style.overflow =
    "hidden";

}


function closeModalWindow() {

  if (!modal) return;

  modal.classList.remove("show");

  document.body.style.overflow =
    "";

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

  let toast =
    document.getElementById(
      "sahariToast"
    );

  if (!toast) {

    toast =
      document.createElement("div");

    toast.id =
      "sahariToast";

    toast.style.position =
      "fixed";

    toast.style.left =
      "50%";

    toast.style.bottom =
      "85px";

    toast.style.transform =
      "translateX(-50%)";

    toast.style.zIndex =
      "9999";

    toast.style.maxWidth =
      "90%";

    toast.style.padding =
      "12px 17px";

    toast.style.borderRadius =
      "14px";

    toast.style.background =
      "#17171c";

    toast.style.color =
      "#ffffff";

    toast.style.fontSize =
      "12px";

    toast.style.fontWeight =
      "600";

    toast.style.textAlign =
      "center";

    toast.style.boxShadow =
      "0 10px 30px rgba(0,0,0,.2)";

    document.body.appendChild(toast);

  }

  toast.textContent =
    message;

  toast.style.display =
    "block";

  clearTimeout(
    window.sahariToastTimer
  );

  window.sahariToastTimer =
    setTimeout(() => {

      toast.style.display =
        "none";

    }, 2600);

}


/* =========================================================
   SECURITY HELPERS
========================================================= */

function escapeHTML(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

  return String(value)

    .replaceAll("\\", "\\\\")

    .replaceAll("'", "\\'")

    .replaceAll('"', '\\"');

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.buyerAction =
  buyerAction;

window.sellerAction =
  sellerAction;

window.createAction =
  createAction;

window.profileAction =
  profileAction;

window.toggleDarkMode =
  toggleDarkMode;

window.requestLocation =
  requestLocation;

window.selectLocation =
  selectLocation;

window.categoryFromAll =
  categoryFromAll;


/* =========================================================
   APP READY
========================================================= */

console.log(
  "Sahari Market initialized successfully."
);
