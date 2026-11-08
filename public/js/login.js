let role = 'student';
const errorEl = document.getElementById('error');

document.querySelectorAll('#roleToggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#roleToggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    role = btn.dataset.role;
  });
});

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  errorEl.hidden = true;
  const btn = e.target.querySelector('.btn-primary');
  btn.disabled = true;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        remember: document.getElementById('remember').checked,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert('Logged in as ' + data.role + '! Dashboards come next.');
  } catch (err) {
    errorEl.textContent = err.message || 'Something went wrong';
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
});