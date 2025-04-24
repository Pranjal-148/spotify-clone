document.addEventListener("DOMContentLoaded", function () {
  function showFormFromHash() {
    const hash = window.location.hash;
    const signup = document.getElementById("signup-container");
    const login = document.getElementById("login-container");
    if (hash === "#login") {
      signup.classList.remove("active");
      login.classList.add("active");
    } else {
      // Default to signup if #signup or no hash
      login.classList.remove("active");
      signup.classList.add("active");
    }
  }
  showFormFromHash();
  window.addEventListener('hashchange', showFormFromHash);

  const signup = document.getElementById("signup-container");
  const login = document.getElementById("login-container");

  // Toggle between signup and login forms
  document.getElementById("show-login").addEventListener("click", () => {
    signup.classList.remove("active");
    login.classList.add("active");
    clearErrors();
  });

  document.getElementById("show-signup").addEventListener("click", () => {
    login.classList.remove("active");
    signup.classList.add("active");
    clearErrors();
  });

  // Password visibility toggle
  document.querySelectorAll(".password-toggle").forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        this.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>`;
      } else {
        input.type = "password";
        this.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
          <line x1="3" y1="3" x2="21" y2="21"></line>
        </svg>`;
      }
    });
  });

  // Toggle between email and phone number
  document.getElementById("phone-link").addEventListener("click", function() {
    const emailField = document.getElementById("email");
    const phoneLink = document.getElementById("phone-link");
    const emailError = document.getElementById("email-error");

    if (emailField.type === "email") {
      emailField.type = "tel";
      emailField.placeholder = "Phone number";
      phoneLink.textContent = "Use email address instead.";
      emailError.textContent = "Please enter a valid phone number";
    } else {
      emailField.type = "email";
      emailField.placeholder = "name@domain.com";
      phoneLink.textContent = "Use phone number instead.";
      emailError.textContent = "Please enter a valid email address";
    }

    // Clear any existing error state
    emailField.classList.remove("error");
    emailError.classList.remove("visible");
  });

  // Form validation for signup
  document.getElementById("signup-btn").addEventListener("click", function(e) {
    e.preventDefault();
    const email = document.getElementById("email");
    const emailError = document.getElementById("email-error");
    let isValid = true;

    if (!email.value.trim()) {
      email.classList.add("error");
      emailError.classList.add("visible");
      isValid = false;
    } else {
      email.classList.remove("error");
      emailError.classList.remove("visible");
    }

    if (isValid) {
      fetch('/api/signup/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(res => res.json())
      .then(data => window.location.href = data.nextStep || 'signup-step2.html')
      .catch(err => {
        console.error('Signup step1 failed:', err);
        alert('There was an issue starting signup. Please try again.');
      });
    }
  });

  // Form validation for login
  document.getElementById("login-btn").addEventListener("click", function(e) {
    e.preventDefault();
    const email = document.getElementById("login-email");
    const password = document.getElementById("password");
    const emailError = document.getElementById("login-email-error");
    const passwordError = document.getElementById("password-error");
    let isValid = true;

    if (!email.value.trim()) {
      email.classList.add("error");
      emailError.classList.add("visible");
      isValid = false;
    } else {
      email.classList.remove("error");
      emailError.classList.remove("visible");
    }

    if (!password.value.trim()) {
      password.classList.add("error");
      passwordError.classList.add("visible");
      isValid = false;
    } else {
      password.classList.remove("error");
      passwordError.classList.remove("visible");
    }

    if (isValid) {
      // Show loading state
      const originalText = this.textContent;
      this.innerHTML = '<span class="spinner"></span> Loading...';
      this.disabled = true;

      // Simulate API call
      setTimeout(() => {
        this.innerHTML = originalText;
        this.disabled = false;
        window.location.href = "index.html";
      }, 2000);
    }
  });

  // Clear form errors when input changes
  document.querySelectorAll(".form-control").forEach(input => {
    input.addEventListener("input", function() {
      this.classList.remove("error");
      const errorEl = document.getElementById(`${this.id}-error`);
      if (errorEl) {
        errorEl.classList.remove("visible");
      }
    });
  });

  // Helper function to clear all errors
  function clearErrors() {
    document.querySelectorAll(".form-control").forEach(input => {
      input.classList.remove("error");
    });

    document.querySelectorAll(".error-message").forEach(error => {
      error.classList.remove("visible");
    });
  }
});
