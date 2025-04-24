// PASSWORD PAGE (STEP 2)
if (document.getElementById('password-form')) {
    // Password toggle
    document.querySelector('.password-toggle').onclick = function() {
      const input = document.getElementById('password');
      if (input.type === 'password') {
        input.type = 'text';
        this.innerHTML = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>`;
      } else {
        input.type = 'password';
        this.innerHTML = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="3" y1="3" x2="21" y2="21"></line>
        </svg>`;
      }
    };
  
    // Password criteria
    const passwordInput = document.getElementById('password');
    const criteria = {
      letter: document.getElementById('criteria-letter'),
      number: document.getElementById('criteria-number'),
      length: document.getElementById('criteria-length')
    };
    passwordInput.addEventListener('input', function() {
      const val = passwordInput.value;
      // Letter
      if (/[a-zA-Z]/.test(val)) {
        criteria.letter.innerHTML = '<span class="pass">●</span> 1 letter';
      } else {
        criteria.letter.innerHTML = '<span>○</span> 1 letter';
      }
      // Number or special character
      if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) {
        criteria.number.innerHTML = '<span class="pass">●</span> 1 number or special character (example: # ? ! &)';
      } else {
        criteria.number.innerHTML = '<span>○</span> 1 number or special character (example: # ? ! &)';
      }
      // Length
      if (val.length >= 10) {
        criteria.length.innerHTML = '<span class="pass">●</span> 10 characters';
      } else {
        criteria.length.innerHTML = '<span>○</span> 10 characters';
      }
    });
  
    // Form submit
    document.getElementById('password-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const passwordInput = document.getElementById('password');
      const val = passwordInput.value;
      const submitButton = document.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
  
      // Immediately disable button to prevent double-submit
      submitButton.disabled = true;
      submitButton.textContent = 'Processing...';
  
      try {
          // Frontend validation
          const isValid = /[a-zA-Z]/.test(val) && 
                         /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val) && 
                         val.length >= 10;
  
          if (!isValid) {
              throw new Error('Password does not meet requirements');
          }
  
          // Backend request
          const response = await fetch('/api/signup/step2', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('temp_token')}` // Add if using
              },
              body: JSON.stringify({ password: val })
          });
  
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Password save failed');
          }
  
          // Handle successful response
          const data = await response.json();
          window.location.href = data.nextStep || 'signup-step3.html';
  
      } catch (error) {
          console.error('Submission error:', error);
          passwordInput.classList.add('error');
          alert(`Error: ${error.message}`);
      } finally {
          // Always reset button state
          submitButton.textContent = originalText;
          submitButton.disabled = false;
      }
  });
  }
  
  // ABOUT PAGE (STEP 3)
  if (document.getElementById('about-form')) {
    // Autofocus
    document.getElementById('name').focus();
  
    // Form validation
    document.getElementById('about-form').onsubmit = async function(e) {
      e.preventDefault();
      const formData = {
          name: document.getElementById('name').value,
          dob: `${document.getElementById('dob-year').value}-${document.getElementById('dob-month').value}-${document.getElementById('dob-day').value}`,
          gender: document.querySelector('input[name="gender"]:checked')?.value
      };

      try {
          const response = await fetch('/api/signup/step3', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });

          if (!response.ok) throw new Error('Profile save failed');
          
          const data = await response.json();
          window.location.href = data.nextStep;
      } catch (error) {
          showError(error.message);
          // Highlight relevant error fields
          if (!formData.name) document.getElementById('name').classList.add('error');
          if (!formData.dob) {
              ['dob-year', 'dob-month', 'dob-day'].forEach(id => 
                  document.getElementById(id).classList.add('error')
              );
          }
          if (!formData.gender) {
              document.querySelectorAll('.signup-gender-options input')
                  .forEach(i => i.classList.add('error'));
          }
      }
  };
  }
  
  // TERMS & CONDITIONS PAGE (STEP 4)
  if (document.getElementById('terms-form')) {
    document.getElementById('terms-form').onsubmit = async function(e) {
        e.preventDefault();
        const button = document.getElementById('signup-final-btn');
        const originalText = button.textContent;
        button.innerHTML = '<span class="spinner"></span> Processing...';
        button.disabled = true;

        try {
            const response = await fetch('/api/signup/step4', {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Registration failed');
            
            window.location.href = "index.html";
        } catch (error) {
            button.innerHTML = originalText;
            button.disabled = false;
            showError(error.message);
        }
    };
}