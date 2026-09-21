document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('usernameInput').value;
            
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', username || 'Admin');
            
            window.location.href = 'dashboard.html';
        });
    }
});