// ================= API BASE (LIVE BACKEND) =================
const API_BASE = "https://agni-welfare-children-website.onrender.com";

// ================= ADMIN CREDENTIALS (FIXED) =================
// Update these values with the fixed admin id/password you want to use
const ADMIN_USERNAME = "Arws2026";
const ADMIN_PASSWORD = "Arws@2026";

// ================= UI MESSAGES (NO ALERTS) =================
function showToast(msg, type = "error") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.className = "toast-message show " + type;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function showFormError(id, msg) {
  const box = document.getElementById(id);
  if (!box) return;

  box.textContent = msg;
  box.style.display = "block";
}

function clearFormError(id) {
  const box = document.getElementById(id);
  if (!box) return;

  box.textContent = "";
  box.style.display = "none";
}


// ================= PAGE SWITCH =================
function showPage(id) {
  // Hide auth section if visible and show website content
  const authSection = document.getElementById("authSection");
  const website = document.getElementById("website");
  
  if (authSection && authSection.style.display !== "none") {
    authSection.style.display = "none";
    document.body.classList.remove("auth-visible");
  }
  
  if (website) {
    website.style.display = "block";
  }
  
  // Show the requested page
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ================= MOBILE MENU =================
function toggleMenu() {
  const header = document.querySelector("header");
  const overlay = document.getElementById("menuOverlay");
  header.classList.toggle("menu-open");

  if (header.classList.contains("menu-open")) {
    overlay?.classList.add("active");
    document.body.style.overflow = "hidden";
  } else {
    overlay?.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function closeMenu() {
  document.querySelector("header")?.classList.remove("menu-open");
  document.getElementById("menuOverlay")?.classList.remove("active");
  document.body.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("nav a").forEach(link =>
    link.addEventListener("click", closeMenu)
  );
});

// ================= PASSWORD TOGGLE =================
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.type = input.type === "password" ? "text" : "password";
  btn.textContent = input.type === "password" ? "👁️" : "🙈";
}

// ================= LOADING =================
function showLoading() {
  document.getElementById("loadingOverlay")?.classList.add("show");
}
function hideLoading() {
  document.getElementById("loadingOverlay")?.classList.remove("show");
}

// ================= TABS =================
function switchTab(tab) {
  document.getElementById("loginForm")?.classList.remove("active");
  document.getElementById("registerForm")?.classList.remove("active");
  document.getElementById("adminForm")?.classList.remove("active");
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

  if (tab === "login") {
    document.getElementById("loginForm")?.classList.add("active");
    document.querySelectorAll(".tab-btn")[0]?.classList.add("active");
  } else if (tab === "register") {
    document.getElementById("registerForm")?.classList.add("active");
    document.querySelectorAll(".tab-btn")[1]?.classList.add("active");
  } else if (tab === "admin") {
    document.getElementById("adminForm")?.classList.add("active");
    document.querySelectorAll(".tab-btn")[2]?.classList.add("active");
  }
}

// ================= AUTH =================
function updateAuthButton() {
  const btn = document.getElementById("authBtn");
  if (!btn) return;

  if (localStorage.getItem("loggedIn") === "yes") {
    btn.textContent = "Logout";
    btn.onclick = logout;
  } else {
    btn.textContent = "Login";
    btn.onclick = openLogin;
  }
}

function openLogin() {
  // Keep the website (header) visible, only hide the page content
  const website = document.getElementById("website");
  const authSection = document.getElementById("authSection");
  const pages = document.querySelectorAll(".page");
  
  // Hide all page content but keep header visible
  pages.forEach(page => page.classList.remove("active"));
  
  // Show auth section
  authSection.style.display = "flex";
  
  // Ensure website container stays visible for header
  website.style.display = "block";
  
  // Add class to body for CSS styling
  document.body.classList.add("auth-visible");
  
  switchTab("login");
}

function logout() {
  localStorage.clear();
  updateAuthButton();
  
  // Keep the website (header) visible, only hide the page content
  const website = document.getElementById("website");
  const authSection = document.getElementById("authSection");
  const pages = document.querySelectorAll(".page");
  
  // Hide all page content but keep header visible
  pages.forEach(page => page.classList.remove("active"));
  
  // Show auth section
  authSection.style.display = "flex";
  
  // Ensure website container stays visible for header
  website.style.display = "block";
  
  // Add class to body for CSS styling
  document.body.classList.add("auth-visible");
  
  switchTab("login");
}

function updateWelcomeName() {
  const el = document.getElementById("welcomeText");
  if (!el) return;
  const name = localStorage.getItem("username");
  el.textContent = name ? "Welcome, " + name : "Welcome";
}

// ================= LOGIN =================
async function login() {
  // determine if admin tab is active
  const isAdmin = document.getElementById("adminForm")?.classList.contains("active");

  const userField = isAdmin ? "adminUser" : "loginUser";
  const passField = isAdmin ? "adminPass" : "loginPass";
  const errorId = isAdmin ? "adminError" : "loginError";

  const username = document.getElementById(userField).value.trim();
  const password = document.getElementById(passField).value;

  clearFormError(errorId);
  if (!username || !password) {
    showFormError(errorId, "Please enter username and password.");
    return;
  }

  // handle fixed admin credentials locally
  if (isAdmin) {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem("loggedIn", "yes");
      localStorage.setItem("username", "Admin");
      localStorage.setItem("isAdmin", "yes");

      document.getElementById("authSection").style.display = "none";
      document.getElementById("website").style.display = "block";
      document.body.classList.remove("auth-visible");
      updateAuthButton();
      updateWelcomeName();
      showPage("home");
    } else {
      showFormError(errorId, "Invalid admin credentials");
    }
    return;
  }

  // normal user login workflow
  showLoading();
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("loggedIn", "yes");
    localStorage.setItem("username", data.user.name);

    document.getElementById("authSection").style.display = "none";
    document.getElementById("website").style.display = "block";
    document.body.classList.remove("auth-visible");

    updateAuthButton();
    updateWelcomeName();
    showPage("home");
  } catch (e) {
    showFormError(errorId, e.message);
  } finally {
    hideLoading();
  }
}

// ================= REGISTER =================
async function register() {
  const name = document.getElementById("registerName").value.trim();
  const username = document.getElementById("registerUsername")?.value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const guardian = document.getElementById("registerGuardian")?.value.trim();
  const address = document.getElementById("registerAddress")?.value.trim();
  const bloodGroup = document.getElementById("registerBlood")?.value.trim();
  const dob = document.getElementById("registerDob")?.value;
  const enrollmentDate = document.getElementById("registerEnrollmentDate")?.value;
  const password = document.getElementById("registerPass").value;
  const confirm = document.getElementById("registerConfirm").value;
  const photoInput = document.getElementById("registerPhoto");

  clearFormError("registerError");

  if (!name || !username || !email || !guardian || !address || !bloodGroup || !dob || !password || !confirm) {
    showFormError("registerError", "Please fill all required registration fields.");
    return;
  }

  if (!photoInput || !photoInput.files || !photoInput.files[0]) {
    showFormError("registerError", "Please upload your photo.");
    return;
  }

  if (password !== confirm) {
    showFormError("registerError", "Passwords do not match.");
    return;
  }

  // Convert photo to base64 for backend / preview
  let photoBase64 = "";
  let photoDataUrl = "";
  try {
    const base64 = await fileToBase64(photoInput.files[0]);
    photoBase64 = base64;
    const mime = photoInput.files[0].type || "image/jpeg";
    photoDataUrl = `data:${mime};base64,${base64}`;
  } catch (err) {
    showFormError("registerError", "Unable to process photo. Please try again.");
    return;
  }


  showLoading();
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Keep backend payload minimal to match existing API
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    localStorage.setItem("loggedIn", "yes");
    localStorage.setItem("username", name);

    showToast("Account created! Your ID card has been generated below.", "success");

    // Populate and show the user ID card
    populateUserIdentityCard({
      name,
      username,
      email,
      guardian,
      address,
      bloodGroup,
      dob,
      enrollmentDate,
      photoDataUrl
    });

    // DO NOT redirect here
    updateAuthButton();
    updateWelcomeName();

  } catch (e) {
    showFormError("registerError", e.message);
  } finally {
    hideLoading();
  }
}

// ================= NCC FORM =================
clearFormError("nccError");
async function submitNCCForm(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  try {
    const res = await fetch(`${API_BASE}/api/ncc-application`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const r = await res.json();
    if (!res.ok) throw new Error(r.message || "Submit failed");

    showToast("Application submitted successfully!", "success");
    e.target.reset();
    showPage("home");
  } catch (err) {
    showFormError("nccError", err.message);
  }
}

// ================= DONATION =================
// ================= DONATION & MEMBERSHIP (RAZORPAY) =================
let selectedAmount = 0;
let currentDonateMode = "donation"; // 'donation' | 'membership'
let currentMembershipType = "monthly"; // 'monthly' | 'yearly'

function selectAmount(amount, btn) {
  selectedAmount = amount;
  document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
}

function switchDonateMode(mode, btn) {
  currentDonateMode = mode;

  document.querySelectorAll(".donate-tab").forEach(b =>
    b.classList.remove("active")
  );
  btn.classList.add("active");

  document.querySelectorAll(".donate-mode").forEach(p =>
    p.classList.remove("active")
  );

  const targetId = mode === "donation" ? "donationMode" : "membershipMode";
  document.getElementById(targetId)?.classList.add("active");

  selectedAmount = 0;
  document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("selected"));

  const payBtn = document.getElementById("payBtn");
  if (payBtn) {
    payBtn.textContent =
      mode === "donation" ? "Proceed to Payment" : "Proceed to Membership Payment";
  }
  updateImpactBox(mode);
}

function setMembershipType(type, btn) {
  currentMembershipType = type; // 'monthly' | 'yearly'

  document.querySelectorAll(".membership-btn").forEach(b =>
    b.classList.remove("active")
  );
  btn.classList.add("active");

  // 🔥 Sync BOTH sides
  updateMembershipAmounts();     // left side 4 boxes
  updateImpactBox("membership"); // right side 4 boxes
}

function updateMembershipAmounts() {
  const amountBtns = document.querySelectorAll("#membershipMode .amount-btn");
  if (!amountBtns.length) return;

  const monthlyAmounts = [300, 500, 1000, 2000];
  const yearlyAmounts = [3600, 6000, 12000, 24000];

  const values =
    currentMembershipType === "yearly" ? yearlyAmounts : monthlyAmounts;

  amountBtns.forEach((btn, i) => {
    const value = values[i];
    btn.textContent = `₹${value.toLocaleString("en-IN")}`;
    btn.setAttribute("onclick", `selectAmount(${value}, this)`);
  });

  // Reset selected state when switching type
  selectedAmount = 0;
  amountBtns.forEach(b => b.classList.remove("selected"));
}

function updateImpactBox(mode) {
  const impactBox = document.querySelector(".impact-box");
  if (!impactBox) return;

  if (mode === "membership") {
    const isYearly = currentMembershipType === "yearly";

    impactBox.innerHTML = `
      <h3>Membership Impact (${isYearly ? "Yearly" : "Monthly"})</h3>

      <div class="impact-item">
        <strong>${isYearly ? "₹3,600" : "₹300"}</strong><br>
        ${isYearly ? "Yearly Basic Supporter" : "Monthly Basic Supporter"}
      </div>

      <div class="impact-item">
        <strong>${isYearly ? "₹6,000" : "₹500"}</strong><br>
        ${isYearly ? "Women’s Club Member (Yearly)" : "Women’s Club Member (Monthly)"}
      </div>

      <div class="impact-item">
        <strong>${isYearly ? "₹12,000" : "₹1,000"}</strong><br>
        ${isYearly ? "Advisory Member (Yearly)" : "Advisory Member (Monthly)"}
      </div>

      <div class="impact-item">
        <strong>${isYearly ? "₹24,000" : "₹2,000"}</strong><br>
        ${isYearly ? "Club Member (Yearly)" : "Club Member (Monthly)"}
      </div>
    `;
  } else {
    // Donation side unchanged
    impactBox.innerHTML = `
      <h3>Your Impact</h3>

      <div class="impact-item">
        <strong>₹100</strong><br>Provides books & stationery for one child
      </div>
      <div class="impact-item">
        <strong>₹500</strong><br>One month nutritious meal for a child
      </div>
      <div class="impact-item">
        <strong>₹1,000</strong><br>Educational supplies for a student
      </div>
      <div class="impact-item">
        <strong>₹5,000</strong><br>Monthly support for rural education program
      </div>
    `;
  }
}


document.getElementById("payBtn")?.addEventListener("click", async () => {
  const customAmountEl = document.getElementById("customAmount");
  const amount = selectedAmount || Number(customAmountEl?.value);
  clearFormError("donationError");
  if (!amount) {
    showFormError("donationError", "Please select or enter an amount.");
    return;
  }


  const nameInput = document.getElementById("donorName");
  const emailInput = document.getElementById("donorEmail");
  const phoneInput = document.getElementById("donorPhone");

  const name = nameInput?.value.trim();
  const email = emailInput?.value.trim();
  const phone = phoneInput?.value.trim();

  // ❌ Block payment if fields empty
  if (!name || !email || !phone) {
    showToast("All fields are required");
    showFormError("donationError", "Please fill Name, Email and Phone number.");
    return;
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email !== "N/A" && !emailRegex.test(email)) {
    showFormError("donationError", "Please enter a valid email address.");
    return;
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phone !== "N/A" && phoneDigits.length !== 10) {
    showFormError("donationError", "Please enter a valid 10-digit phone number.");
    return;

  }

  const donationType =
    currentDonateMode === "donation"
      ? "DONATION"
      : currentMembershipType === "monthly"
        ? "MEMBERSHIP_MONTHLY"
        : "MEMBERSHIP_YEARLY";

  try {
    const res = await fetch(`${API_BASE}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, donationType })
    });

    const order = await res.json();
    if (!res.ok) throw new Error(order.message || "Unable to create order");

    new Razorpay({
      key: order.key,
      amount: order.amount,
      currency: "INR",
      name: "Agni Rural Welfare Society",
      description:
        donationType === "DONATION"
          ? "One-time Donation"
          : donationType === "MEMBERSHIP_MONTHLY"
            ? "Monthly Membership"
            : "Yearly Membership",
      order_id: order.id,
      notes: {
        type: donationType,
        donor_name: name,
        donor_email: email
      },
      handler: async response => {
        const userId = localStorage.getItem("userId") || null;

        await fetch(`${API_BASE}/save-donation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            name,
            email,
            phone,
            amount,
            type: donationType,
            razorpay_payment_id: response.razorpay_payment_id
          })
        });

        showToast("Payment successful! Thank you for your support.", "success");
      }
    }).open();
  } catch (err) {
    showToast("Payment failed. Please try again.");
    console.error(err);
  }
});


// ================= AUTO LOGIN =================
window.addEventListener("load", () => {
  const authSection = document.getElementById("authSection");
  const website = document.getElementById("website");

  if (localStorage.getItem("loggedIn") === "yes") {
    authSection.style.display = "none";
    website.style.display = "block";
    updateAuthButton();
    updateWelcomeName();
    showPage("home");
  }

  // Auto-set today's date for enrollment date in register form
  const enrollInput = document.getElementById("registerEnrollmentDate");
  if (enrollInput && !enrollInput.value) {
    const today = new Date().toISOString().split("T")[0];
    enrollInput.value = today;
  }
});

// ================= GALLERY (LOCAL IMAGES – FIXED) =================
let currentGalleryIndex = 0;

const galleryImages = [
  "image1.jpg", "image3.jpg", "image4.jpg", "image5.jpg", "image6.jpg", "image7.jpg",
  "image8.jpg", "image9.jpg", "image10.jpg", "image11.jpg", "image14.jpg", "image15.jpg",
  "image16.jpg", "image17.jpg", "image18.jpg", "image19.jpg", "image20.jpg", "image21.jpg",
  "image22.jpg", "image23.jpg", "image24.jpg", "image25.jpg", "image26.jpg", "image27.jpg",
  "image28.jpg", "image29.jpg", "image30.jpg", "image31.jpg", "image32.jpg", "image33.jpg",
  "image34.jpg", "image35.jpg", "image36.jpg", "image37.jpg", "image38.jpg", "image39.jpg",
  "image40.jpg", "image41.jpg", "image42.jpg", "image43.jpg", "image44.jpg", "image45.jpg",
  "image46.jpg", "image47.jpg", "image48.jpg", "image49.jpg", "image50.jpg"
];

function loadGallery() {
  if (!galleryImages.length) {
    document.getElementById("currentImageIndex").textContent = "0";
    document.getElementById("totalImages").textContent = "0";
    return;
  }

  document.getElementById("totalImages").textContent = galleryImages.length;
  currentGalleryIndex = 0;
  updateGalleryImage();
}

function updateGalleryImage() {
  const img = document.getElementById("galleryImage");
  if (!img) return;

  img.src = galleryImages[currentGalleryIndex];

  document.getElementById("currentImageIndex").textContent =
    currentGalleryIndex + 1;

  const percent =
    ((currentGalleryIndex + 1) / galleryImages.length) * 100;
  document.getElementById("progressBar").style.width = percent + "%";
}

function nextImage() {
  if (!galleryImages.length) return;
  currentGalleryIndex =
    (currentGalleryIndex + 1) % galleryImages.length;
  updateGalleryImage();
}

function previousImage() {
  if (!galleryImages.length) return;
  currentGalleryIndex =
    (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
  updateGalleryImage();
}

function openGallery() {
  showPage("gallery");
  loadGallery();
}

window.addEventListener("load", () => {
  if (document.getElementById("gallery")?.classList.contains("active")) {
    loadGallery();
  }
});

// ===== Supporters Logos Interaction (Optional Enhancements) =====

document.querySelectorAll(".logo-card").forEach(card => {
  card.addEventListener("mouseenter", () => {
    card.style.transition = "all 0.25s ease";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transition = "all 0.3s ease";
  });
});

function nextCadetStep() {
  clearFormError("cadetError1");

  const cadetName = document.getElementById("cadetName");
  const gender = document.getElementById("cadetGenderSelect").value; // ✅ FIXED
  const fatherName = document.getElementById("fatherName");
  const motherName = document.getElementById("motherName");
  const guardianName = document.getElementById("guardianName");
  const aadhaar = document.getElementById("aadhaar");
  const cadetAddress = document.getElementById("cadetAddress");
  const citizenship = document.getElementById("citizenship");
  const photo = document.getElementById("cadetPhoto").files[0];

  if (
    !cadetName.value.trim() ||
    !gender ||
    !fatherName.value.trim() ||
    !motherName.value.trim() ||
    !guardianName.value.trim() ||
    !aadhaar.value.trim() ||
    !cadetAddress.value.trim() ||
    !citizenship.value ||
    !photo
  ) {
    showFormError("cadetError1", "Please fill all required fields on Page 1.");
    return;
  }

  document.getElementById("cadetStep1").classList.remove("active");
  document.getElementById("cadetStep2").classList.add("active");
}


function prevCadetStep() {
  cadetStep2.classList.remove("active");
  cadetStep1.classList.add("active");
}

async function finishCadetFlow() {
  clearFormError("cadetError2");

  // Get all form elements
  const cadetName = document.getElementById("cadetName");
  const gender = document.getElementById("cadetGenderSelect");
  const fatherName = document.getElementById("fatherName");
  const motherName = document.getElementById("motherName");
  const guardianName = document.getElementById("guardianName");
  const aadhaar = document.getElementById("aadhaar");
  const cadetAddress = document.getElementById("cadetAddress");
  const citizenship = document.getElementById("citizenship");
  const photo = document.getElementById("cadetPhoto");
  const village = document.getElementById("village");
  const tehsil = document.getElementById("tehsil");
  const district = document.getElementById("district");
  const pincode = document.getElementById("pincode");
  const postOffice = document.getElementById("postOffice");
  const railwayStation = document.getElementById("railwayStation");
  const education = document.getElementById("education");
  const dob = document.getElementById("dob");
  const school = document.getElementById("school");
  const training = document.getElementById("training");
  const resAddress = document.getElementById("resAddress");
  const contactNo = document.getElementById("contactNo");
  const cadetEmail = document.getElementById("cadetEmail");

  // Validate all required fields
  if (
    !cadetName.value.trim() ||
    !gender.value ||
    !fatherName.value.trim() ||
    !motherName.value.trim() ||
    !guardianName.value.trim() ||
    !aadhaar.value.trim() ||
    !cadetAddress.value.trim() ||
    !citizenship.value ||
    !photo.files[0] ||
    !village.value.trim() ||
    !tehsil.value.trim() ||
    !district.value.trim() ||
    !pincode.value.trim() ||
    !postOffice.value.trim() ||
    !education.value.trim() ||
    !dob.value ||
    !school.value.trim() ||
    !training.value ||
    !resAddress.value.trim() ||
    !contactNo.value.trim() ||
    !cadetEmail.value.trim()
  ) {
    showFormError("cadetError2", "Please fill all required fields including email address.");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cadetEmail.value.trim())) {
    showFormError("cadetError2", "Please enter a valid email address.");
    return;
  }

  // Convert photo to base64
  let photoBase64 = "";
  let photoDataUrl = "";
  try {
    const result = await fileToBase64(photo.files[0]);
    photoBase64 = result; // Base64 string without prefix (for backend)
    photoDataUrl = `data:image/jpeg;base64,${result}`; // Full data URL (for display)
  } catch (error) {
    showFormError("cadetError2", "Error processing photo. Please try again.");
    return;
  }

  // Prepare form data
  const formData = {
    name: cadetName.value.trim(),
    gender: gender.value,
    fatherName: fatherName.value.trim(),
    fatherOccupation: document.getElementById("fatherOcc").value.trim(),
    fatherIncome: document.getElementById("fatherIncome").value.trim(),
    motherName: motherName.value.trim(),
    motherOccupation: document.getElementById("motherOcc").value.trim(),
    motherIncome: document.getElementById("motherIncome").value.trim(),
    guardianName: guardianName.value.trim(),
    aadhaar: aadhaar.value.trim(),
    address: cadetAddress.value.trim(),
    citizenship: citizenship.value,
    village: village.value.trim(),
    tehsil: tehsil.value.trim(),
    district: district.value.trim(),
    pincode: pincode.value.trim(),
    postOffice: postOffice.value.trim(),
    railwayStation: railwayStation.value.trim(),
    education: education.value.trim(),
    dateOfBirth: dob.value,
    school: school.value.trim(),
    training: training.value,
    residentialAddress: resAddress.value.trim(),
    contactNumber: contactNo.value.trim(),
    email: cadetEmail.value.trim(),
    photo: photoBase64
  };

  // Show loading
  showLoading();

  try {
    // Submit to backend API
    const response = await fetch(`${API_BASE}/api/cadet-enrollment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text.substring(0, 200));
      throw new Error("Server returned an invalid response. Please check if the API endpoint is configured correctly.");
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || "Registration failed. Please try again.");
    }

    // Store registration data for identity card generation
    window.cadetRegistrationData = {
      ...formData,
      registrationId: result.registrationId,
      photoBase64: photoBase64,
      photoDataUrl: photoDataUrl
    };

    // Show success modal with registration ID
    showRegistrationSuccess(result.registrationId);

    // Generate and store identity card
    generateIdentityCard(result.registrationId, formData, photoDataUrl);

  } catch (error) {
    console.error("Registration error:", error);
    let errorMessage = error.message;
    
    // Provide more helpful error messages
    if (errorMessage.includes("invalid response")) {
      errorMessage = "The server is not responding correctly. Please contact support or try again later.";
    } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
      errorMessage = "Network error. Please check your internet connection and try again.";
    }
    
    showFormError("cadetError2", errorMessage);
    showToast(errorMessage, "error");
  } finally {
    hideLoading();
  }
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Return base64 string without data URL prefix (for backend API)
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Show registration success modal
function showRegistrationSuccess(registrationId) {
  document.getElementById("displayRegistrationId").textContent = registrationId;
  document.getElementById("registrationSuccessModal").style.display = "flex";
}

// Close registration modal
function closeRegistrationModal() {
  document.getElementById("registrationSuccessModal").style.display = "none";
  // Reset form and redirect
  showPage("home");
  showToast("Registration completed successfully! Check your email for details.", "success");
}

// Copy registration ID to clipboard
function copyRegistrationId() {
  const regId = document.getElementById("displayRegistrationId").textContent;
  navigator.clipboard.writeText(regId).then(() => {
    showToast("Registration ID copied to clipboard!", "success");
  }).catch(() => {
    showToast("Failed to copy. Please copy manually.", "error");
  });
}

// Generate identity card
function generateIdentityCard(registrationId, formData, photoDataUrl) {
  // Update identity card template
  document.getElementById("idCardRegId").textContent = registrationId;
  document.getElementById("idCardName").textContent = formData.name;
  document.getElementById("idCardDOB").textContent = formData.dateOfBirth;
  document.getElementById("idCardAadhaar").textContent = formData.aadhaar;
  document.getElementById("idCardContact").textContent = formData.contactNumber;
  
  // Set photo
  if (photoDataUrl) {
    document.getElementById("idCardPhoto").src = photoDataUrl;
  }

  // Store for download
  window.identityCardData = {
    registrationId,
    formData,
    photoDataUrl
  };
}

// Download identity card as image/PDF
async function downloadIdentityCard() {
  if (!window.identityCardData) {
    showToast("Identity card data not available. Please try again.", "error");
    return;
  }

  try {
    const identityCardElement = document.getElementById("identityCardTemplate");
    
    // Show the identity card template temporarily for rendering
    const originalDisplay = identityCardElement.style.display;
    identityCardElement.style.display = "block";
    identityCardElement.style.position = "absolute";
    identityCardElement.style.left = "-9999px";
    
    // Generate image using html2canvas
    if (typeof html2canvas !== "undefined") {
      const canvas = await html2canvas(identityCardElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        width: 400,
        height: 500
      });
      
      // Try to generate PDF using jsPDF
      if (typeof window.jspdf !== "undefined") {
        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [85, 54] // ID card size in mm
        });
        
        const imgWidth = 85;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`ARWS_ID_${window.identityCardData.registrationId}.pdf`);
        showToast("Identity card downloaded as PDF!", "success");
      } else {
        // Fallback to PNG download
        const link = document.createElement("a");
        link.download = `ARWS_ID_${window.identityCardData.registrationId}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("Identity card downloaded as image!", "success");
      }
    } else {
      showToast("Identity card will be sent to your email. Download feature requires additional libraries.", "success");
    }
    
    // Restore original display
    identityCardElement.style.display = originalDisplay;
    identityCardElement.style.position = "";
    identityCardElement.style.left = "";
    
  } catch (error) {
    console.error("Download error:", error);
    showToast("Download failed. The identity card will be sent to your email.", "error");
  }
}

function openCadetFlow() {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("website").style.display = "block";
  document.body.classList.remove("auth-visible");
  showPage("cadetFlow");
}

function skipCadetFlow() {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("website").style.display = "block";
  document.body.classList.remove("auth-visible");
  showPage("home");
}

// ================= USER REGISTER ID CARD (LOGIN TAB) =================
function populateUserIdentityCard(data) {
  const section = document.getElementById("userIdCardSection");
  if (!section) return;

  document.getElementById("userIdFullName").textContent = data.name || "-";
  document.getElementById("userIdUsername").textContent = data.username || "-";
  document.getElementById("userIdEmail").textContent = data.email || "-";
  document.getElementById("userIdGuardian").textContent = data.guardian || "-";
  document.getElementById("userIdAddress").textContent = data.address || "-";
  document.getElementById("userIdBlood").textContent = data.bloodGroup || "-";
  document.getElementById("userIdDob").textContent = data.dob || "-";
  document.getElementById("userIdEnroll").textContent = data.enrollmentDate || "-";

  const img = document.getElementById("userIdPhotoPreview");
  if (img && data.photoDataUrl) {
    img.src = data.photoDataUrl;
  }

  section.style.display = "block";
  window.userIdentityCardData = data;
}

async function downloadUserIdentityCard() {
  if (!window.userIdentityCardData) {
    showToast("ID card not ready yet. Please create your account first.", "error");
    return;
  }

  const cardElement = document.getElementById("userIdCardContainer");
  if (!cardElement) return;

  try {
    if (typeof html2canvas === "undefined") {
      showToast("Download requires html2canvas library.", "error");
      return;
    }

    const canvas = await html2canvas(cardElement, {
      backgroundColor: "#ffffff",
      scale: 2
    });

    if (typeof window.jspdf !== "undefined") {
      const { jsPDF } = window.jspdf;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85, 54]
      });

      const imgWidth = 85;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      const fileName = window.userIdentityCardData.username || "card";
      pdf.save(`ARWS_USER_ID_${fileName}.pdf`);
      showToast("User ID card downloaded!", "success");
    } else {
      const link = document.createElement("a");
      const fileName = window.userIdentityCardData.username || "card";
      link.download = `ARWS_USER_ID_${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("User ID card downloaded as image!", "success");
    }
  } catch (err) {
    console.error("User ID download error:", err);
    showToast("Failed to download ID card. Please try again.", "error");
  }
}

