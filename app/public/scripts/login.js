document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.getElementById('password');
    
    // Toggle password visibility
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const email = formData.get('email');
            const password = formData.get('password');
            const remember = formData.get('remember');
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            try {
                await login(email, password);
                
                // Store remember preference
                if (remember) {
                    localStorage.setItem('rememberLogin', 'true');
                } else {
                    localStorage.removeItem('rememberLogin');
                }
                
            } catch (error) {
                console.error('Login error:', error);
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        });
    }
    
    // Auto-fill email if user chose to be remembered
    const rememberLogin = localStorage.getItem('rememberLogin');
    const savedEmail = localStorage.getItem('savedEmail');
    
    if (rememberLogin && savedEmail) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('remember').checked = true;
    }
    
    // Social login handlers
    const googleBtn = document.querySelector('.btn-google');
    const microsoftBtn = document.querySelector('.btn-microsoft');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            showMessage('Login com Google em desenvolvimento', 'info');
        });
    }
    
    if (microsoftBtn) {
        microsoftBtn.addEventListener('click', function() {
            showMessage('Login com Microsoft em desenvolvimento', 'info');
        });
    }
});

// Enhanced login function
async function login(email, password) {
    try {
        showLoading();
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store authentication data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('savedEmail', email);
            
            if (data.user) {
                localStorage.setItem('userData', JSON.stringify(data.user));
            }
            
            showMessage('Login realizado com sucesso!', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                const returnUrl = new URLSearchParams(window.location.search).get('return') || '/dashboard';
                window.location.href = returnUrl;
            }, 1500);
            
        } else {
            throw new Error(data.erro || 'Erro ao fazer login');
        }
        
    } catch (error) {
        showMessage(error.message || 'Erro de conexão. Tente novamente.', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}