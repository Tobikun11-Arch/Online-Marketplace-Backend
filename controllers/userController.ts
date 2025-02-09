import { Request, Response } from 'express';
import bcrypt from 'bcrypt'
import dotenv from "dotenv"
import { GenerateTokens } from '../middleware/AuthenticatedJWT';
import User from '../models/user';
const crypto = require('crypto');
const sendMail = require('../services/sendMail');

dotenv.config();

interface RequestWithUser extends Request {
  user?: any;
}

interface NewUser {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  Role: string;
  Username: string;
  emailToken: string;
}

export const Register = async (req: Request, res: Response) => {
  const { FirstName, LastName, PhoneNumber, PetName, Email, Password, Role, Username } = req.body;
  if (!Email || !Password) {
    return res.status(400).json({ error: 'Email and Password are required' });
  }
  const userRole = Role
  const newUser = User(userRole)  

  const lowerCaseEmail = Email.toLowerCase();

  try {
    const existedBuyer = await User('buyer').findOne({ Email: Email.toLowerCase() })
    const existedSeller = await User('seller').findOne({ Email: Email.toLowerCase() })
    if (existedBuyer || existedSeller) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
      const HashPassword = await bcrypt.hash(Password, 10);
      if(FirstName === "First Name") {
        const emailToken = crypto.randomBytes(64).toString('hex');
        await sendMail(lowerCaseEmail, emailToken)
        const newUsers = new newUser({ FirstName, LastName, PhoneNumber, PetName, Email: lowerCaseEmail, Password: HashPassword, Role, Username, emailToken });
        await newUsers.save();
        res.status(201).json({
          success: true,
          message: "User created successfully"
        });
      } else {
        const newUsers = new newUser({ FirstName, LastName, PhoneNumber, PetName, Email: lowerCaseEmail, Password: HashPassword, Role, Username, isVerifiedEmail: true });
        await newUsers.save();
        res.status(201).json({ message: "success register(socmed)" });
      }
  }
  catch (error) {
      console.error('Error registering user:', error);      
      res.status(500).json({ message: 'Registration failed',  success: false });
  }
};

export const Login = async (req: Request, res: Response) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ error: 'Email and Password are required' });
  }

  try {
    let user = await User('buyer').findOne({ Email: Email.toLowerCase() });
    if(!user) { 
      user = await User('seller').findOne({ Email: Email.toLowerCase() });
    }

    if (!user || !(await user.comparePassword(Password))) {
      return res.status(401).json({ error: 'Invalid Email or Password' });
    }

    if (user.isVerifiedEmail === true) {
      const { accessToken, refreshToken } = GenerateTokens(user._id.toString());

      res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: 'none',
      });

      res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 2 * 60 * 60 * 1000,
          sameSite: 'none',
      });

      user.refreshToken = refreshToken
      await user.save();
      return res.json({ message: 'Login successful', user });
    }

    else if (user.isVerifiedEmail === false) {
      return res.status(401).json({ error: 'Invalid Email or Password' });
    }
  } 

  catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const CheckUser = async (req: Request, res: Response) => {
  const { Email } = req.body;
  try {
      let user = await User('buyer').findOne({ Email: Email.toLowerCase() });
      if (user) {
          return res.json({ Role: 'Buyer' });
      }

      user = await User('seller').findOne({ Email: Email.toLowerCase() });
      if (user) {
          return res.json({ Role: 'Seller' });
      }

      return res.status(404).json({ error: "User not found" });

  } catch (error) {
      console.error('Error Checking:', error);
      return res.status(500).json({ error: "Server error" });
  }
};
