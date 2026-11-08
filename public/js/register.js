let role = 'student';
let studyLevel = 'GCE_AL';

const errorEl = document.getElementById('error');
const studyBlock = document.getElementById('studyBlock');

function pick(containerId, attr, cb) {
  document.querySelectorAll(`#${containerId} button`).forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(`#${containerId} button`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cb(btn.dataset[attr]);
    });
  });
}

pick('roleToggle', 'role', v => {
  role = v;
  studyBlock.hidden = role === 'tutor';
});
pick('studyChips', 'level', v => (studyLevel = v));

document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  errorEl.hidden = true;

  if (!document.getElementById('terms').checked) {
    errorEl.textContent = 'Please accept the terms to continue';
    errorEl.hidden = false;
    return;
  }

  const btn = e.target.querySelector('.btn-primary');
  btn.disabled = true;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        fullName: document.getElementById('fullName').value,
        mobile: document.getElementById('mobile').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        studyLevel: role === 'student' ? studyLevel : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert('Account created! Dashboards come next.');
  } catch (err) {
    errorEl.textContent = err.message || 'Something went wrong';
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
});