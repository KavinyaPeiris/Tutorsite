require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/login.html'));

app.use('/api/auth', require('./src/routes/auth'));

app.listen(process.env.PORT, () =>
  console.log(`Running on http://localhost:${process.env.PORT}`)
);