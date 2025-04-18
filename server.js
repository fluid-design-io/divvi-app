#!/usr/bin/env node

const path = require('path');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const { createRequestHandler } = require('@expo/server/adapter/express');

const CLIENT_BUILD_DIR = path.join(__dirname, 'dist', 'client');
const SERVER_BUILD_DIR = path.join(__dirname, 'dist', 'server');

const app = express();
app.use(compression());
app.disable('x-powered-by');

// Serve your static web build (if you have one)
app.use(
  express.static(CLIENT_BUILD_DIR, {
    maxAge: '1h',
    extensions: ['html'],
  })
);

// Log requests
app.use(morgan('tiny'));

// Delegate *all* other routes (including your /api routes) to Expo’s server runtime
app.all(
  '*',
  createRequestHandler({
    build: SERVER_BUILD_DIR,
  })
);

// Honor the PORT env var that Coolify will set
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
