document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Authentication pages...');
  
  enhanceAuthForms();
  addPasswordValidation();
  addRealTimeValidation();
  
  console.log('Authentication pages initialized successfully!');

  function enhanceAuthForms() {
    const authForms = document.querySelectorAll('.auth-form');
    
    authForms.forEach(form => {
      // Prevenir duplo submit
      let isSubmitting = false;
      
      form.addEventListener('submit', function(e) {
        if (isSubmitting) {
          e.preventDefault();
          return false;
        }
        
        isSubmitting = true;
        
        // Adicionar indicador de loading nos botões de submit
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          const originalText = submitButton.textContent;
          submitButton.style.opacity = '0.7';
          submitButton.style.cursor = 'not-allowed';
          submitButton.textContent = originalText.includes('Entrar') || originalText.includes('Login') ? 'Entrando...' : 'Registrando...';
          submitButton.disabled = true;
          
          // Adicionar spinner
          const spinner = document.createElement('span');
          spinner.innerHTML = ' ⏳';
          submitButton.appendChild(spinner);
          
          // Reabilitar em caso de erro (timeout de segurança)
          setTimeout(() => {
            if (isSubmitting) {
              submitButton.style.opacity = '1';
              submitButton.style.cursor = 'pointer';
              submitButton.textContent = originalText;
              submitButton.disabled = false;
              isSubmitting = false;
            }
          }, 10000); // 10 segundos timeout
        }
      });

      // Melhorar feedback visual dos inputs
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        // Efeitos de foco
        input.addEventListener('focus', function() {
          this.style.borderColor = '#C8A964';
          this.style.boxShadow = '0 0 10px rgba(200, 169, 100, 0.3)';
          this.style.transform = 'translateY(-1px)';
          
          // Destacar o label
          const label = form.querySelector(`label[for="${this.id}"]`);
          if (label) {
            label.style.color = '#C8A964';
            label.style.fontWeight = 'bold';
          }
        });

        input.addEventListener('blur', function() {
          this.style.borderColor = '#463714';
          this.style.boxShadow = 'none';
          this.style.transform = 'translateY(0)';
          
          // Restaurar o label
          const label = form.querySelector(`label[for="${this.id}"]`);
          if (label) {
            label.style.color = '#CDBE91';
            label.style.fontWeight = 'normal';
          }
        });

        // Animação de digitação
        input.addEventListener('input', function() {
          if (this.value.length > 0) {
            this.style.backgroundColor = 'rgba(200, 169, 100, 0.1)';
          } else {
            this.style.backgroundColor = 'rgba(70, 55, 20, 0.2)';
          }
        });
      });
    });
  }

  function addPasswordValidation() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
      // Adicionar indicador de força da senha
      if (input.name === 'password' && !input.name.includes('confirm')) {
        addPasswordStrengthIndicator(input);
      }
      
      // Adicionar toggle de visibilidade
      addPasswordToggle(input);
    });
    
    // Validação de confirmação de senha
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    const passwordInput = document.querySelector('input[name="password"]');
    
    if (confirmPasswordInput && passwordInput) {
      confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch(passwordInput, confirmPasswordInput);
      });
      
      passwordInput.addEventListener('input', function() {
        if (confirmPasswordInput.value) {
          validatePasswordMatch(passwordInput, confirmPasswordInput);
        }
      });
    }
  }

  function addPasswordStrengthIndicator(passwordInput) {
    const strengthIndicator = document.createElement('div');
    strengthIndicator.style.cssText = `
      margin-top: 0.5rem;
      font-size: 0.8rem;
      transition: all 0.3s ease;
    `;
    
    passwordInput.parentNode.appendChild(strengthIndicator);
    
    passwordInput.addEventListener('input', function() {
      const strength = calculatePasswordStrength(this.value);
      updateStrengthIndicator(strengthIndicator, strength);
    });
  }

  function calculatePasswordStrength(password) {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    return { score, checks };
  }

  function updateStrengthIndicator(indicator, { score, checks }) {
    const levels = [
      { text: 'Muito fraca', color: '#dc3545', bgColor: 'rgba(220, 53, 69, 0.1)' },
      { text: 'Fraca', color: '#fd7e14', bgColor: 'rgba(253, 126, 20, 0.1)' },
      { text: 'Regular', color: '#ffc107', bgColor: 'rgba(255, 193, 7, 0.1)' },
      { text: 'Boa', color: '#20c997', bgColor: 'rgba(32, 201, 151, 0.1)' },
      { text: 'Forte', color: '#28a745', bgColor: 'rgba(40, 167, 69, 0.1)' },
      { text: 'Muito forte', color: '#007bff', bgColor: 'rgba(0, 123, 255, 0.1)' }
    ];
    
    const level = Math.min(score, levels.length - 1);
    const { text, color, bgColor } = levels[level];
    
    indicator.innerHTML = `
      <div style="
        color: ${color};
        background: ${bgColor};
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
        border-left: 3px solid ${color};
      ">
        Força da senha: ${text}
      </div>
    `;
  }

  function addPasswordToggle(passwordInput) {
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.innerHTML = '👁️';
    toggleButton.style.cssText = `
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    `;
    
    // Tornar o container do input relativo
    passwordInput.parentNode.style.position = 'relative';
    passwordInput.style.paddingRight = '40px';
    
    passwordInput.parentNode.appendChild(toggleButton);
    
    toggleButton.addEventListener('click', function() {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      this.innerHTML = isPassword ? '🙈' : '👁️';
      this.style.opacity = isPassword ? '1' : '0.7';
    });
    
    toggleButton.addEventListener('mouseenter', function() {
      this.style.opacity = '1';
    });
    
    toggleButton.addEventListener('mouseleave', function() {
      if (passwordInput.type === 'password') {
        this.style.opacity = '0.7';
      }
    });
  }

  function validatePasswordMatch(passwordInput, confirmPasswordInput) {
    const match = passwordInput.value === confirmPasswordInput.value;
    
    if (confirmPasswordInput.value === '') {
      confirmPasswordInput.style.borderColor = '#463714';
      removeValidationMessage(confirmPasswordInput);
      return;
    }
    
    if (match) {
      confirmPasswordInput.style.borderColor = '#28a745';
      confirmPasswordInput.style.boxShadow = '0 0 5px rgba(40, 167, 69, 0.3)';
      showValidationMessage(confirmPasswordInput, '✅ Senhas coincidem', '#28a745');
    } else {
      confirmPasswordInput.style.borderColor = '#dc3545';
      confirmPasswordInput.style.boxShadow = '0 0 5px rgba(220, 53, 69, 0.3)';
      showValidationMessage(confirmPasswordInput, '❌ Senhas não coincidem', '#dc3545');
    }
  }

  function showValidationMessage(input, message, color) {
    removeValidationMessage(input);
    
    const messageElement = document.createElement('div');
    messageElement.className = 'validation-message';
    messageElement.style.cssText = `
      font-size: 0.8rem;
      margin-top: 0.3rem;
      color: ${color};
      transition: all 0.3s ease;
    `;
    messageElement.textContent = message;
    
    input.parentNode.appendChild(messageElement);
  }

  function removeValidationMessage(input) {
    const existingMessage = input.parentNode.querySelector('.validation-message');
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  function addRealTimeValidation() {
    // Validação em tempo real para email
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.addEventListener('input', function() {
        const isValid = this.checkValidity();
        
        if (this.value === '') {
          this.style.borderColor = '#463714';
          removeValidationMessage(this);
          return;
        }
        
        if (isValid) {
          this.style.borderColor = '#28a745';
          this.style.boxShadow = '0 0 5px rgba(40, 167, 69, 0.3)';
          showValidationMessage(this, '✅ Email válido', '#28a745');
        } else {
          this.style.borderColor = '#dc3545';
          this.style.boxShadow = '0 0 5px rgba(220, 53, 69, 0.3)';
          showValidationMessage(this, '❌ Email inválido', '#dc3545');
        }
      });
    }
    
    // Validação para username
    const usernameInput = document.querySelector('input[name="username"]');
    if (usernameInput) {
      usernameInput.addEventListener('input', function() {
        const value = this.value;
        const isValid = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
        
        if (value === '') {
          this.style.borderColor = '#463714';
          removeValidationMessage(this);
          return;
        }
        
        if (isValid) {
          this.style.borderColor = '#28a745';
          this.style.boxShadow = '0 0 5px rgba(40, 167, 69, 0.3)';
          showValidationMessage(this, '✅ Username válido', '#28a745');
        } else {
          this.style.borderColor = '#dc3545';
          this.style.boxShadow = '0 0 5px rgba(220, 53, 69, 0.3)';
          showValidationMessage(this, '❌ Mín. 3 caracteres, apenas letras, números e _', '#dc3545');
        }
      });
    }
  }
});