import fs from 'fs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const privateKey = fs.readFileSync(`./lib/auth/AuthKey_${process.env.APPLE_KEY_ID}.p8`);
const now = Math.floor(Date.now() / 1000);

const clientSecret = jwt.sign(
  {
    iss: process.env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 15777000, // max 6 months
    aud: 'https://appleid.apple.com',
    sub: process.env.APPLE_CLIENT_ID, // your Services ID
  },
  privateKey,
  {
    algorithm: 'ES256',
    keyid: process.env.APPLE_KEY_ID,
  }
);

console.log(clientSecret);
