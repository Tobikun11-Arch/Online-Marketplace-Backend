import { Router } from "express";
import User from '../models/user';
import { useRouter } from "next/navigation";

const router = Router();

router.get('/verify/:token', async (req, res) => {
    const { token } = req.params;
    const routers = useRouter()

    try {
      const user = await User('buyer').findOne({ emailToken: token }) || await User('seller').findOne({ emailToken: token });
    
        if (!user) {
          
          return res.status(404).json({ message: 'Invalid token.' });

        }
        
        if (user.isVerifiedEmail) {

          return res.status(400).json({ message: 'Email is already verified.' });
      }

      user.isVerifiedEmail = true;
      user.emailToken = undefined;
      await user.save();
      routers.push('/');

    } 
    
    catch (error) {

      console.error('Error verifying email:', error);
      res.status(500).json({ message: 'Internal server error' });

    }

  });

  export default router;