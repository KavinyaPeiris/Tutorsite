const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'users.json');

function load() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return []; }
}

function save(users) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}

exports.findByEmail = async (email) => load().find(u => u.email === email) || null;
exports.findById = async (id) => load().find(u => u.id === id) || null;

exports.create = async (data) => {
  const users = load();
  const user = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    ...data,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  save(users);
  return user;
};