document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    // Password strength checker
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // Password confirmation checker
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            checkPasswordMatch();
        });
        
        passwordInput.addEventListener('input', function() {
            if (confirmPasswordInput.value) {
                checkPasswordMatch();
            }
        });
    }
    
    // Toggle password visibility
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    });
    
    // Handle form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm(this)) {
                return;
            }
            
            const formData = new FormData(this);
            const userData = {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                email: formData.get('email'),
                password: formData.get('password'),
                profession: formData.get('profession'),
                newsletter: formData.get('newsletter') === 'on'
            };
            
            const submitBtn = this.querySelector('button[type="submit"]');
            
            // Loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            try {
                await register(userData);
            } catch (error) {
                console.error('Registration error:', error);
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        });
    }
    
    // Social registration handlers
    const googleBtn = document.querySelector('.btn-google');
    const microsoftBtn = document.querySelector('.btn-microsoft');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            showMessage('Cadastro com Google em desenvolvimento', 'info');
        });
    }
    
    if (microsoftBtn) {
        microsoftBtn.addEventListener('click', function() {
            showMessage('Cadastro com Microsoft em desenvolvimento', 'info');
        });
    }
});

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength');
    const strengthText = document.querySelector('.strength-text');
    
    if (!password) {
        strengthBar.className = 'password-strength';
        strengthText.textContent = 'Digite uma senha';
        return;
    }
    
    let score = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    // Determine strength
    if (score < 3) {
        strengthBar.className = 'password-strength strength-weak';
        feedback = 'Senha fraca';
    } else if (score < 4) {
        strengthBar.className = 'password-strength strength-fair';
        feedback = 'Senha razoável';
    } else if (score < 5) {
        strengthBar.className = 'password-strength strength-good';
        feedback = 'Senha boa';
    } else {
        strengthBar.className = 'password-strength strength-strong';
        feedback = 'Senha forte';
    }
    
    strengthText.textContent = feedback;
}

function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        showFieldError(confirmInput, 'As senhas não coincidem');
    } else {
        removeFieldError(confirmInput);
    }
}

// Enhanced register function
async function register(userData) {
    try {
        showLoading();
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Conta criada com sucesso! Verifique seu e-mail.', 'success');
            
            // Clear form
            document.getElementById('register-form').reset();
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = '/login?message=account-created';
            }, 2000);
            
        } else {
            throw new Error(data.erro || 'Erro ao criar conta');
        }
        
    } catch (error) {
        showMessage(error.message || 'Erro de conexão. Tente novamente.', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// Enhanced form validation for registration
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('input[required]');
    
    // Basic validation
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Email validation
    const email = form.querySelector('input[type="email"]');
    if (email && email.value && !isValidEmail(email.value)) {
        showFieldError(email, 'Por favor, insira um email válido');
        isValid = false;
    }
    
    // Password validation
    const password = form.querySelector('input[name="password"]');
    if (password && password.value) {
        if (password.value.length < 6) {
            showFieldError(password, 'A senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }
    }
    
    // Password confirmation
    const confirmPassword = form.querySelector('input[name="confirmPassword"]');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        showFieldError(confirmPassword, 'As senhas não coincidem');
        isValid = false;
    }
    
    // Terms acceptance
    const terms = form.querySelector('input[name="terms"]');
    if (terms && !terms.checked) {
        showMessage('Você deve aceitar os Termos de Uso para continuar', 'error');
        isValid = false;
    }
    
    return isValid;
}