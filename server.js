#!/usr/bin/env node

const path = require('path');
const { createRequestHandler } = require('@expo/server/adapter/express');

const express = require('express');
const compression = require('compression');
const morgan = require('morgan');

console.log('🔥', process.env.DATABASE_URL);

const CLIENT_BUILD_DIR = path.join(process.cwd(), 'dist/client');
const SERVER_BUILD_DIR = path.join(process.cwd(), 'dist/server');

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

process.env.NODE_ENV = 'production';

app.use(
  express.static(CLIENT_BUILD_DIR, {
    maxAge: '1h',
    extensions: ['html'],
  })
);

app.use(morgan('tiny'));

// Serve .well-known/apple-app-site-association
app.get('/.well-known/apple-app-site-association', (_req, res) => {
  const filePath = path.join(CLIENT_BUILD_DIR, '.well-known/apple-app-site-association');
  console.log('🔥 Attempting to serve apple-app-site-association from:', filePath);

  try {
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('🔥 Successfully read file contents');

    res.setHeader('Content-Type', 'application/json');
    res.send(content);
  } catch (err) {
    console.error('🔥 Error reading/sending apple-app-site-association:', err);
    res.status(500).json({ error: 'Failed to serve apple-app-site-association' });
  }
});

app.all(
  '*splat',
  createRequestHandler({
    build: SERVER_BUILD_DIR,
  })
);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
