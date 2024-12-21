import { Request, Response } from 'express';
import User from '../models/user';

export const SearchList = async (req: Request, res: Response) => {
    const { userId, search } = req.body;
    try {
        const dispose_exceed = await User('buyer').findById(userId) //Find if user exist on db

        if(dispose_exceed) {
            const user = await User('buyer').updateOne(
                {
                    _id: userId
                }, {
                    $push: { 
                        SearchData: {
                            $each: [search],
                            $slice: -20
                        }
                    }
                }
            )
    
            if(user.modifiedCount > 0){
                return res.status(200).json({ message: "new search added" })
            }
    
            else {
                return res.status(200).json({ message: "Guess only" })
            }
        }
    } catch (error) {
        console.error("Failed to push ", error)
    }
}
