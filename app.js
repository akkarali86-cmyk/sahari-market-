/* =========================================================
   SAHARI MARKET
   APP.JS
   Supabase Authentication + Frontend
========================================================= */

"use strict";

/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
  "https://xibnnxefalspqwvugaez.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_vwEIJFyv21P9bIDfT_xrGQ_PaExsv5F";

let supabaseClient = null;


/* =========================================================
   APP STATE
========================================================= */

const AppState = {

  favorites:
    JSON.parse(
      localStorage.getItem("sahari_favorites") || "[]"
    ),

  darkMode:
    localStorage.getItem("sahari_dark_mode") === "true",

  currentPage: "home",

  user: null,

  profile: null
};


/* =========================================================
   ELEMENTS
========================================================= */

const modal =
  document.getElementById("modal");

const modalBody =
  document.getElementById("modalBody");

const closeModal =
  document.getElementById("closeModal");

const modalOverlay =
  document.getElementById("modalOverlay");

const searchInput =
  document.getElementById("searchInput");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  initializeSupabase();

  initializeDarkMode();

  initializeNavigation();

  initializeFavorites();

  initializeCategories();

  initializeSearch();

  initializeMainButtons();

  initializeModal();

  await initializeAuth();

});


/* =========================================================
   SUPABASE
========================================================= */

function initializeSupabase() {

  if (typeof window.supabase === "undefined") {

    console.error(
      "Supabase library was not loaded."
    );

    return false;
  }

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

  console.log(
    "Supabase initialized successfully."
  );

  return true;
}


/* =========================================================
   AUTH
========================================================= */

async function initializeAuth() {

  if (!supabaseClient) return;

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();

    if (error) {

      console.error(
        "Session error:",
        error
      );

      return;
    }

    if (data.session) {

      AppState.user =
        data.session.user;

      await loadUserProfile();

      console.log(
        "User session restored."
      );
    }


    supabaseClient.auth.onAuthStateChange(
      async (event, session) => {

        console.log(
          "Auth event:",
          event
        );

        if (session) {

          AppState.user =
            session.user;

          await loadUserProfile();

        } else {

          AppState.user = null;

          AppState.profile = null;
        }

      }
    );

  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

  }
}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadUserProfile() {

  if (
    !supabaseClient ||
    !AppState.user
  ) return;

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", AppState.user.id)
      .maybeSingle();

    if (error) {

      console.error(
        "Profile loading error:",
        error
      );

      return;
    }

    AppState.profile = data;

    console.log(
      "Profile loaded:",
      data
    );

  } catch (error) {

    console.error(
      "Profile error:",
      error
    );

  }
}


/* =========================================================
   REGISTER
========================================================= */

async function registerUser(
  fullName,
  email,
  password,
  phone
) {

  if (!supabaseClient) {

    showToast(
      "Supabase غير متصل."
    );

    return;
  }

  if (
    !fullName ||
    !email ||
    !password
  ) {

    showToast(
      "يرجى ملء جميع الحقول المطلوبة."
    );

    return;
  }

  if (password.length < 6) {

    showToast(
      "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
    );

    return;
  }

  try {

    showToast(
      "جاري إنشاء الحساب..."
    );

    const {
      data,
      error
    } = await supabaseClient.auth.signUp({

      email: email.trim(),

      password: password,

      options: {

        data: {

          full_name:
            fullName.trim(),

          phone:
            phone
              ? phone.trim()
              : ""

        }

      }

    });


    if (error) {

      console.error(error);

      showToast(
        translateAuthError(
          error.message
        )
      );

      return;
    }


    if (data.user) {

      if (data.session) {

        AppState.user =
          data.user;

        await loadUserProfile();

        closeModalWindow();

        showToast(
          "تم إنشاء حسابك بنجاح 🎉"
        );

        setTimeout(
          openProfile,
          500
        );

      } else {

        closeModalWindow();

        openVerificationMessage();

      }

    }

  } catch (error) {

    console.error(error);

    showToast(
      "حدث خطأ أثناء إنشاء الحساب."
    );

  }
}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser(
  email,
  password
) {

  if (!supabaseClient) {

    showToast(
      "Supabase غير متصل."
    );

    return;
  }

  if (
    !email ||
    !password
  ) {

    showToast(
      "أدخل البريد الإلكتروني وكلمة المرور."
    );

    return;
  }

  try {

    showToast(
      "جاري تسجيل الدخول..."
    );

    const {
      data,
      error
    } = await supabaseClient.auth
      .signInWithPassword({

        email:
          email.trim(),

        password:
          password

      });


    if (error) {

      console.error(error);

      showToast(
        translateAuthError(
          error.message
        )
      );

      return;
    }


    AppState.user =
      data.user;

    await loadUserProfile();

    closeModalWindow();

    showToast(
      "تم تسجيل الدخول بنجاح 👋"
    );

    setTimeout(
      openProfile,
      500
    );

  } catch (error) {

    console.error(error);

    showToast(
      "حدث خطأ أثناء تسجيل الدخول."
    );

  }
}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

  if (!supabaseClient) return;

  try {

    const {
      error
    } = await supabaseClient.auth.signOut();

    if (error) {

      console.error(error);

      showToast(
        "تعذر تسجيل الخروج."
      );

      return;
    }

    AppState.user = null;

    AppState.profile = null;

    closeModalWindow();

    showToast(
      "تم تسجيل الخروج 👋"
    );

  } catch (error) {

    console.error(error);

    showToast(
      "حدث خطأ أثناء تسجيل الخروج."
    );

  }
}


/* =========================================================
   AUTH ERROR TRANSLATION
========================================================= */

function translateAuthError(message) {

  const text =
    String(message).toLowerCase();

  if (
    text.includes(
      "invalid login credentials"
    )
  ) {

    return (
      "البريد الإلكتروني أو كلمة المرور غير صحيحة."
    );

  }

  if (
    text.includes(
      "user already registered"
    )
  ) {

    return (
      "هذا البريد الإلكتروني مسجل بالفعل."
    );

  }

  if (
    text.includes(
      "email not confirmed"
    )
  ) {

    return (
      "يرجى تأكيد بريدك الإلكتروني أولاً."
    );

  }

  if (
    text.includes(
      "password should be at least"
    )
  ) {

    return (
      "كلمة المرور قصيرة جدًا."
    );

  }

  if (
    text.includes(
      "rate limit"
    )
  ) {

    return (
      "لقد حاولت عدة مرات. انتظر قليلًا ثم حاول مجددًا."
    );

  }

  return (
    "حدث خطأ. حاول مرة أخرى."
  );
}


/* =========================================================
   LOGIN FORM
========================================================= */

function openLoginForm() {

  openModal(`

    <h2 class="modal-title">
      🔐 تسجيل الدخول
    </h2>

    <p class="modal-text">
      ادخل إلى حسابك في سوق الصحاري.
    </p>

    <form
      id="loginForm"
      onsubmit="submitLogin(event)"
    >

      <div class="form-group">

        <label>
          البريد الإلكتروني
        </label>

        <input
          id="loginEmail"
          type="email"
          placeholder="example@email.com"
          required
          autocomplete="email"
        >

      </div>

      <div class="form-group">

        <label>
          كلمة المرور
        </label>

        <input
          id="loginPassword"
          type="password"
          placeholder="••••••••"
          required
          autocomplete="current-password"
        >

      </div>

      <button
        class="primary-btn"
        type="submit"
      >
        تسجيل الدخول
      </button>

    </form>

    <button
      class="modal-option"
      onclick="openRegisterForm()"
    >

      <div class="modal-option-icon">
        👤
      </div>

      <div>

        <strong>
          إنشاء حساب جديد
        </strong>

        <small>
          ليس لديك حساب؟ سجّل مجانًا
        </small>

      </div>

    </button>

  `);
}


/* =========================================================
   LOGIN SUBMIT
========================================================= */

async function submitLogin(event) {

  event.preventDefault();

  const email =
    document.getElementById(
      "loginEmail"
    )?.value;

  const password =
    document.getElementById(
      "loginPassword"
    )?.value;

  await loginUser(
    email,
    password
  );
}


/* =========================================================
   REGISTER FORM
========================================================= */

function openRegisterForm() {

  openModal(`

    <h2 class="modal-title">
      👤 إنشاء حساب
    </h2>

    <p class="modal-text">
      أنشئ حسابك مجانًا في سوق الصحاري.
    </p>

    <form
      id="registerForm"
      onsubmit="submitRegister(event)"
    >

      <div class="form-group">

        <label>
          الاسم الكامل *
        </label>

        <input
          id="registerName"
          type="text"
          placeholder="اسمك الكامل"
          required
          autocomplete="name"
        >

      </div>

      <div class="form-group">

        <label>
          البريد الإلكتروني *
        </label>

        <input
          id="registerEmail"
          type="email"
          placeholder="example@email.com"
          required
          autocomplete="email"
        >

      </div>

      <div class="form-group">

        <label>
          رقم الهاتف
        </label>

        <input
          id="registerPhone"
          type="tel"
          placeholder="05xxxxxxxx"
          autocomplete="tel"
        >

      </div>

      <div class="form-group">

        <label>
          كلمة المرور *
        </label>

        <input
          id="registerPassword"
          type="password"
          placeholder="6 أحرف على الأقل"
          minlength="6"
          required
          autocomplete="new-password"
        >

      </div>

      <button
        class="primary-btn"
        type="submit"
      >
        إنشاء الحساب
      </button>

    </form>

    <button
      class="modal-option"
      onclick="openLoginForm()"
    >

      <div class="modal-option-icon">
        🔐
      </div>

      <div>

        <strong>
          لدي حساب بالفعل
        </strong>

        <small>
          تسجيل الدخول
        </small>

      </div>

    </button>

  `);
}


/* =========================================================
   REGISTER SUBMIT
========================================================= */

async function submitRegister(event) {

  event.preventDefault();

  const name =
    document.getElementById(
      "registerName"
    )?.value;

  const email =
    document.getElementById(
      "registerEmail"
    )?.value;

  const phone =
    document.getElementById(
      "registerPhone"
    )?.value;

  const password =
    document.getElementById(
      "registerPassword"
    )?.value;

  await registerUser(
    name,
    email,
    password,
    phone
  );
}


/* =========================================================
   EMAIL VERIFICATION
========================================================= */

function openVerificationMessage() {

  openModal(`

    <div class="search-empty">

      <div>
        📧
      </div>

      <h2>
        تحقق من بريدك الإلكتروني
      </h2>

      <p>
        أرسلنا رسالة تأكيد إلى بريدك الإلكتروني.
        افتح الرسالة واضغط على رابط التأكيد،
        ثم يمكنك تسجيل الدخول.
      </p>

    </div>

    <button
      class="primary-btn"
      onclick="openLoginForm()"
    >
      العودة لتسجيل الدخول
    </button>

  `);
}


/* =========================================================
   PROFILE
========================================================= */

function openProfile() {

  if (AppState.user) {

    openLoggedInProfile();

    return;
  }

  openGuestProfile();
}


/* =========================================================
   GUEST PROFILE
========================================================= */

function openGuestProfile() {

  openModal(`

    <h2 class="modal-title">
      👤 حسابي
    </h2>

    <p class="modal-text">
      أنشئ حسابك للوصول إلى جميع ميزات
      سوق الصحاري.
    </p>

    <button
      class="modal-option"
      onclick="openLoginForm()"
    >

      <div class="modal-option-icon">
        🔐
      </div>

      <div>

        <strong>
          تسجيل الدخول
        </strong>

        <small>
          لديك حساب بالفعل؟
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="openRegisterForm()"
    >

      <div class="modal-option-icon">
        👤
      </div>

      <div>

        <strong>
          إنشاء حساب
        </strong>

        <small>
          أنشئ حسابًا جديدًا مجانًا
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="toggleDarkMode()"
    >

      <div class="modal-option-icon">
        🌙
      </div>

      <div>

        <strong>
          الوضع الليلي
        </strong>

        <small>
          تغيير مظهر التطبيق
        </small>

      </div>

    </button>

  `);
}


/* =========================================================
   LOGGED IN PROFILE
========================================================= */

function openLoggedInProfile() {

  const profile =
    AppState.profile || {};

  const name =
    profile.full_name ||
    AppState.user?.email ||
    "مستخدم سوق الصحاري";

  const role =
    profile.role ||
    "buyer";

  const roleText = {

    buyer:
      "مشتري",

    seller:
      "بائع / مقدم خدمة",

    both:
      "مشتري + بائع"

  };


  openModal(`

    <div class="profile-header">

      <div class="profile-avatar">
        👤
      </div>

      <h2 class="modal-title">
        ${escapeHTML(name)}
      </h2>

      <p class="modal-text">
        ${escapeHTML(
          roleText[role] || "مستخدم"
        )}
      </p>

    </div>

    <button
      class="modal-option"
      onclick="switchAccountRole()"
    >

      <div class="modal-option-icon">
        🔄
      </div>

      <div>

        <strong>
          تغيير نوع الحساب
        </strong>

        <small>
          مشتري / بائع / كلاهما
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="openAccountInfo()"
    >

      <div class="modal-option-icon">
        ⚙️
      </div>

      <div>

        <strong>
          معلومات الحساب
        </strong>

        <small>
          الاسم والهاتف والموقع
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="toggleDarkMode()"
    >

      <div class="modal-option-icon">
        🌙
      </div>

      <div>

        <strong>
          الوضع الليلي
        </strong>

        <small>
          تغيير مظهر التطبيق
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="logoutUser()"
    >

      <div class="modal-option-icon">
        🚪
      </div>

      <div>

        <strong>
          تسجيل الخروج
        </strong>

        <small>
          الخروج من حسابك
        </small>

      </div>

    </button>

  `);
}


/* =========================================================
   ACCOUNT ROLE
========================================================= */

function switchAccountRole() {

  openModal(`

    <h2 class="modal-title">
      🔄 نوع الحساب
    </h2>

    <p class="modal-text">
      يمكنك استخدام سوق الصحاري كمشتري وبائع.
    </p>

    <button
      class="modal-option"
      onclick="updateUserRole('buyer')"
    >

      <div class="modal-option-icon">
        🛍️
      </div>

      <div>

        <strong>
          مشتري
        </strong>

        <small>
          أشتري المنتجات والخدمات
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="updateUserRole('seller')"
    >

      <div class="modal-option-icon">
        🏪
      </div>

      <div>

        <strong>
          بائع / مقدم خدمة
        </strong>

        <small>
          أبيع المنتجات أو أقدم الخدمات
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="updateUserRole('both')"
    >

      <div class="modal-option-icon">
        🔄
      </div>

      <div>

        <strong>
          كلاهما
        </strong>

        <small>
          أشتري وأبيع
        </small>

      </div>

    </button>

  `);
}


/* =========================================================
   UPDATE ROLE
========================================================= */

async function updateUserRole(role) {

  if (
    !supabaseClient ||
    !AppState.user
  ) return;

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("profiles")
      .update({

        role:
          role,

        updated_at:
          new Date().toISOString()

      })
      .eq(
        "id",
        AppState.user.id
      )
      .select()
      .single();


    if (error) {

      console.error(error);

      showToast(
        "تعذر تحديث نوع الحساب."
      );

      return;
    }


    AppState.profile =
      data;

    closeModalWindow();

    showToast(
      "تم تحديث نوع الحساب ✅"
    );

  } catch (error) {

    console.error(error);

    showToast(
      "حدث خطأ."
    );

  }
}


/* =========================================================
   ACCOUNT INFO
========================================================= */

function openAccountInfo() {

  const profile =
    AppState.profile || {};

  openModal(`

    <h2 class="modal-title">
      ⚙️ معلومات الحساب
    </h2>

    <div class="account-info">

      <p>
        <strong>الاسم:</strong>
        ${escapeHTML(
          profile.full_name ||
          "غير محدد"
        )}
      </p>

      <p>
        <strong>البريد:</strong>
        ${escapeHTML(
          AppState.user?.email || ""
        )}
      </p>

      <p>
        <strong>الهاتف:</strong>
        ${escapeHTML(
          profile.phone ||
          "غير محدد"
        )}
      </p>

      <p>
        <strong>الولاية:</strong>
        ${escapeHTML(
          profile.wilaya ||
          "الجلفة"
        )}
      </p>

      <p>
        <strong>البلدية:</strong>
        ${escapeHTML(
          profile.commune ||
          "حد الصحاري"
        )}
      </p>

    </div>

  `);
}


/* =========================================================
   DARK MODE
========================================================= */

function initializeDarkMode() {

  if (AppState.darkMode) {

    document.body.classList.add(
      "dark"
    );
  }
}


function toggleDarkMode() {

  document.body.classList.toggle(
    "dark"
  );

  AppState.darkMode =
    document.body.classList.contains(
      "dark"
    );

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
   NAVIGATION
========================================================= */

function initializeNavigation() {

  const navItems =
    document.querySelectorAll(
      ".nav-item"
    );

  navItems.forEach(item => {

    item.addEventListener(
      "click",
      () => {

        const page =
          item.dataset.page;

        if (!page) return;

        navItems.forEach(nav =>
          nav.classList.remove(
            "active"
          )
        );

        if (page !== "create") {

          item.classList.add(
            "active"
          );
        }

        handleNavigation(page);

      }
    );

  });
}


function handleNavigation(page) {

  AppState.currentPage =
    page;

  switch (page) {

    case "home":

      window.scrollTo({

        top: 0,

        behavior:
          "smooth"

      });

      break;


    case "search":

      searchInput?.focus();

      window.scrollTo({

        top: 0,

        behavior:
          "smooth"

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
    document.querySelectorAll(
      ".favorite-btn"
    );

  buttons.forEach(
    (button, index) => {

      const id =
        `business-${index}`;

      if (
        AppState.favorites.includes(id)
      ) {

        button.classList.add(
          "liked"
        );

        button.textContent =
          "♥";
      }

      button.addEventListener(
        "click",
        () => {

          toggleFavorite(
            id,
            button
          );

        }
      );

    }
  );
}


function toggleFavorite(
  id,
  button
) {

  const index =
    AppState.favorites.indexOf(
      id
    );

  if (index === -1) {

    AppState.favorites.push(id);

    button.classList.add(
      "liked"
    );

    button.textContent =
      "♥";

    showToast(
      "تمت الإضافة إلى المفضلة ❤️"
    );

  } else {

    AppState.favorites.splice(
      index,
      1
    );

    button.classList.remove(
      "liked"
    );

    button.textContent =
      "♡";

    showToast(
      "تمت إزالة العنصر من المفضلة"
    );
  }

  localStorage.setItem(
    "sahari_favorites",
    JSON.stringify(
      AppState.favorites
    )
  );
}


/* =========================================================
   CATEGORIES
========================================================= */

function initializeCategories() {

  const categories =
    document.querySelectorAll(
      ".category-card"
    );

  categories.forEach(
    category => {

      category.addEventListener(
        "click",
        () => {

          const name =
            category.querySelector(
              "span"
            )?.textContent ||
            "التصنيف";

          showCategory(name);

        }
      );

    }
  );
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

        <strong>
          المنتجات
        </strong>

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

        <strong>
          المحلات
        </strong>

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

        <strong>
          الخدمات
        </strong>

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

      card.style.display =
        "flex";

      if (query) {
        found = true;
      }

    } else {

      card.style.display =
        "none";
    }

  });


  let result =
    document.getElementById(
      "searchResultMessage"
    );


  if (!result) {

    result =
      document.createElement(
        "div"
      );

    result.id =
      "searchResultMessage";

    result.className =
      "search-empty";

    const list =
      document.getElementById(
        "businessList"
      );

    if (list) {

      list.parentNode.insertBefore(
        result,
        list
      );
    }

  }


  if (
    query &&
    !found
  ) {

    result.innerHTML = `

      <div>🔎</div>

      <p>
        لم نجد نتائج مطابقة لـ
        "<strong>
          ${escapeHTML(query)}
        </strong>"
      </p>

    `;

    result.style.display =
      "block";

  } else {

    result.style.display =
      "none";
  }

}


/* =========================================================
   MAIN BUTTONS
========================================================= */

function initializeMainButtons() {

  const buyerBtn =
    document.getElementById(
      "buyerBtn"
    );

  const sellerBtn =
    document.getElementById(
      "sellerBtn"
    );

  const exploreBtn =
    document.getElementById(
      "exploreBtn"
    );

  const nearbyBtn =
    document.getElementById(
      "nearbyBtn"
    );

  const postsBtn =
    document.getElementById(
      "postsBtn"
    );

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


  buyerBtn?.addEventListener(
    "click",
    openBuyerMenu
  );

  sellerBtn?.addEventListener(
    "click",
    openSellerMenu
  );

  exploreBtn?.addEventListener(
    "click",
    () => {

      document.querySelector(
        ".section"
      )?.scrollIntoView({
        behavior:
          "smooth"
      });

    }
  );

  nearbyBtn?.addEventListener(
    "click",
    openNearby
  );

  postsBtn?.addEventListener(
    "click",
    openPosts
  );

  allCategoriesBtn?.addEventListener(
    "click",
    openAllCategories
  );

  changeLocationBtn?.addEventListener(
    "click",
    openLocation
  );

  notificationBtn?.addEventListener(
    "click",
    openNotifications
  );
}


/* =========================================================
   BUYER
========================================================= */

function openBuyerMenu() {

  openModal(`

    <h2 class="modal-title">
      🛍️ ماذا تريد؟
    </h2>

    <p class="modal-text">
      ابحث عن المنتجات والمحلات والخدمات القريبة منك.
    </p>

    <button
      class="modal-option"
      onclick="buyerAction('products')"
    >

      <div class="modal-option-icon">
        📦
      </div>

      <div>

        <strong>
          المنتجات
        </strong>

        <small>
          الملابس، الإلكترونيات، المواد الغذائية وغيرها
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="buyerAction('shops')"
    >

      <div class="modal-option-icon">
        🏪
      </div>

      <div>

        <strong>
          المحلات
        </strong>

        <small>
          اكتشف المتاجر القريبة منك
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="buyerAction('services')"
    >

      <div class="modal-option-icon">
        🔧
      </div>

      <div>

        <strong>
          الخدمات
        </strong>

        <small>
          ابحث عن الأشخاص ومقدمي الخدمات
        </small>

      </div>

    </button>

  `);
}


function buyerAction(type) {

  closeModalWindow();

  const messages = {

    products:
      "قسم المنتجات قادم 📦",

    shops:
      "قسم المحلات قادم 🏪",

    services:
      "قسم الخدمات قادم 🔧"

  };

  showToast(
    messages[type] ||
    "قريبًا"
  );
}


/* =========================================================
   SELLER
========================================================= */

function openSellerMenu() {

  openModal(`

    <h2 class="modal-title">
      🏪 افتح نشاطك
    </h2>

    <p class="modal-text">
      اختر نوع النشاط الذي تريد إنشاءه.
    </p>

    <button
      class="modal-option"
      onclick="sellerAction('store')"
    >

      <div class="modal-option-icon">
        🏪
      </div>

      <div>

        <strong>
          متجر
        </strong>

        <small>
          بيع المنتجات عبر سوق الصحاري
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="sellerAction('service')"
    >

      <div class="modal-option-icon">
        🔧
      </div>

      <div>

        <strong>
          خدمة
        </strong>

        <small>
          قدم خدماتك للعملاء
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="sellerAction('restaurant')"
    >

      <div class="modal-option-icon">
        🍔
      </div>

      <div>

        <strong>
          مطعم / مأكولات
        </strong>

        <small>
          اعرض الوجبات والعروض
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="sellerAction('transport')"
    >

      <div class="modal-option-icon">
        🚕
      </div>

      <div>

        <strong>
          نقل
        </strong>

        <small>
          سيارات، توصيل، نقل أشخاص أو بضائع
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="sellerAction('freelancer')"
    >

      <div class="modal-option-icon">
        💼
      </div>

      <div>

        <strong>
          مستقل
        </strong>

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

    store:
      "متجر",

    service:
      "خدمة",

    restaurant:
      "مطعم / مأكولات",

    transport:
      "نقل",

    freelancer:
      "مستقل"

  };


  if (!AppState.user) {

    showToast(
      "يجب إنشاء حساب أولاً 👤"
    );

    setTimeout(
      openRegisterForm,
      500
    );

    return;
  }


  showToast(
    `سيتم إنشاء نشاط: ${names[type]} 🏪`
  );
}


/* =========================================================
   CREATE
========================================================= */

function openCreateMenu() {

  openModal(`

    <h2 class="modal-title">
      ＋ إنشاء
    </h2>

    <p class="modal-text">
      ماذا تريد أن تنشئ؟
    </p>

    <button
      class="modal-option"
      onclick="createAction('post')"
    >

      <div class="modal-option-icon">
        📝
      </div>

      <div>

        <strong>
          منشور
        </strong>

        <small>
          شارك شيئًا مع مجتمع سوق الصحاري
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="createAction('store')"
    >

      <div class="modal-option-icon">
        🏪
      </div>

      <div>

        <strong>
          نشاط تجاري
        </strong>

        <small>
          افتح متجرًا أو خدمة
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="createAction('product')"
    >

      <div class="modal-option-icon">
        📦
      </div>

      <div>

        <strong>
          منتج
        </strong>

        <small>
          أضف منتجًا لنشاطك
        </small>

      </div>

    </button>

  `);
}


function createAction(type) {

  closeModalWindow();

  if (!AppState.user) {

    showToast(
      "أنشئ حسابًا أولاً لاستخدام هذه الميزة 👤"
    );

    setTimeout(
      openRegisterForm,
      500
    );

    return;
  }


  const names = {

    post:
      "منشور",

    store:
      "نشاط تجاري",

    product:
      "منتج"

  };

  showToast(
    `إنشاء ${names[type]} سيكون متاحًا في الخطوة التالية 🚀`
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

      <div>
        ❤️
      </div>

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
   LOCATION
========================================================= */

function openNearby() {

  openModal(`

    <h2 class="modal-title">
      📍 قريب منك
    </h2>

    <p class="modal-text">
      اسمح للتطبيق بتحديد موقعك لعرض الأنشطة القريبة.
    </p>

    <button
      class="modal-option"
      onclick="requestLocation()"
    >

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
      "المتصفح لا يدعم تحديد الموقع."
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
        "تم تحديد موقعك 📍"
      );

      console.log(
        "Location:",
        lat,
        lng
      );

    },

    () => {

      showToast(
        "لم نتمكن من تحديد موقعك."
      );

    }

  );
}


/* =========================================================
   LOCATION SELECTOR
========================================================= */

function openLocation() {

  openModal(`

    <h2 class="modal-title">
      📍 تغيير الموقع
    </h2>

    <p class="modal-text">
      اختر المنطقة التي تريد استكشافها.
    </p>

    <button
      class="modal-option"
      onclick="selectLocation('حد الصحاري')"
    >

      <div class="modal-option-icon">
        📍
      </div>

      <div>

        <strong>
          حد الصحاري
        </strong>

        <small>
          الجلفة
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="selectLocation('الجلفة')"
    >

      <div class="modal-option-icon">
        📍
      </div>

      <div>

        <strong>
          مدينة الجلفة
        </strong>

        <small>
          ولاية الجلفة
        </small>

      </div>

    </button>

    <button
      class="modal-option"
      onclick="requestLocation()"
    >

      <div class="modal-option-icon">
        📡
      </div>

      <div>

        <strong>
          استخدم موقعي الحالي
        </strong>

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

  localStorage.setItem(
    "sahari_location",
    location
  );

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

      <button
        class="modal-option"
        onclick="categoryFromAll('${escapeAttribute(category[1])}')"
      >

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

      <div>
        🔔
      </div>

      <p>
        لا توجد إشعارات جديدة حاليًا.
      </p>

    </div>

  `);
}


/* =========================================================
   MODAL
========================================================= */

function initializeModal() {

  closeModal?.addEventListener(
    "click",
    closeModalWindow
  );

  modalOverlay?.addEventListener(
    "click",
    closeModalWindow
  );
}


function openModal(content) {

  if (
    !modal ||
    !modalBody
  ) return;

  modalBody.innerHTML =
    content;

  modal.classList.add(
    "show"
  );

  document.body.style.overflow =
    "hidden";
}


function closeModalWindow() {

  if (!modal) return;

  modal.classList.remove(
    "show"
  );

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
      document.createElement(
        "div"
      );

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

    document.body.appendChild(
      toast
    );
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

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );
}


function escapeAttribute(value) {

  return String(value)

    .replaceAll(
      "\\",
      "\\\\"
    )

    .replaceAll(
      "'",
      "\\'"
    )

    .replaceAll(
      '"',
      '\\"'
    );
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

window.toggleDarkMode =
  toggleDarkMode;

window.requestLocation =
  requestLocation;

window.selectLocation =
  selectLocation;

window.categoryFromAll =
  categoryFromAll;

window.openLoginForm =
  openLoginForm;

window.openRegisterForm =
  openRegisterForm;

window.submitLogin =
  submitLogin;

window.submitRegister =
  submitRegister;

window.logoutUser =
  logoutUser;

window.switchAccountRole =
  switchAccountRole;

window.updateUserRole =
  updateUserRole;

window.openAccountInfo =
  openAccountInfo;


/* =========================================================
   APP READY
========================================================= */

console.log(
  "Sahari Market initialized successfully."
);
