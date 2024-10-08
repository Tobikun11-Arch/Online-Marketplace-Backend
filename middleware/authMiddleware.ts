import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user'; 
import { IUser } from '../models/user'

interface RequestWithUser extends Request {

    user?: IUser;

  }


export const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; 
    
    if (!token) {

        return res.status(401).json({ error: 'No token provided' });

    }

    try {

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!); 
        const user = await User.findById(decoded.userId) as IUser;

        if (!user) {
            
            return res.status(401).json({ error: 'Unauthorized' });

        }

        req.user = user; 
        next(); 
    } 
    
    catch (error) {

        res.status(401).json({ error: 'Invalid token' });

    }

};