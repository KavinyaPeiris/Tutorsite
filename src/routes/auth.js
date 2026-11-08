const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const users = require('../userStore');
const { requireAuth } = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const levels = ['GCE_OL', 'GCE_AL', 'OTHER'];

function setTokenCookie(res, user, remember) {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: remember ? '30d' : '1d' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    ...(remember && { maxAge: 30 * 24 * 60 * 60 * 1000 }),
  });
}

router.post('/register', limiter, async (req, res) => {
  try {
    const { role, fullName, mobile, email, password, confirmPassword, studyLevel } = req.body;

    if (!['student', 'tutor'].includes(role))
      return res.status(400).json({ error: 'Invalid role' });
    if (!fullName?.trim() || !mobile?.trim() || !email?.trim())
      return res.status(400).json({ error: 'All fields are required' });
    if (!emailRe.test(email))
      return res.status(400).json({ error: 'Invalid email address' });
    if (!/^[0-9+\s-]{9,15}$/.test(mobile))
      return res.status(400).json({ error: 'Invalid mobile number' });
    if (!password || password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match' });
    if (role === 'student' && !levels.includes(studyLevel))
      return res.status(400).json({ error: 'Please select what you are studying for' });

    const existing = await users.findByEmail(email.toLowerCase());
    if (existing)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const user = await users.create({
      role,
      full_name: fullName.trim(),
      mobile: mobile.trim(),
      email: email.toLowerCase(),
      password_hash: hash,
      study_level: role === 'student' ? studyLevel : null,
    });

    setTokenCookie(res, user, false);
    res.status(201).json({ message: 'Account created', role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', limiter, async (req, res) => {
  try {
    const { role, email, password, remember } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await users.findByEmail(email.toLowerCase());
    const ok = user && user.role === role && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    setTokenCookie(res, user, !!remember);
    res.json({ message: 'Logged in', role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await users.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ id: user.id, role: user.role, full_name: user.full_name, email: user.email });
});

module.exports = router;