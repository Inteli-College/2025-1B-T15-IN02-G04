// Newsletter subscription
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = this.email.value;
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Loading state
            submitBtn.textContent = 'Inscrevendo...';
            submitBtn.disabled = true;
            
            try {
                // Simular chamada à API
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Sucesso
                showMessage('Inscrição realizada com sucesso!', 'success');
                this.reset();
                
            } catch (error) {
                showMessage('Erro ao inscrever. Tente novamente.', 'error');
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});