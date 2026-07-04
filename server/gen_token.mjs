import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const token = jwt.sign(
  { userId: '6a348819c5b648fa7666325d', email: 'adenijipeter2018@gmail.com', role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
console.log('TOKEN:', token);
