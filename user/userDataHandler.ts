import { Request, Response } from 'express';
import User from '../models/user';

export const SearchList = async (req: Request, res: Response) => {
    const { userId, search, deleteItem } = req.body;

    try {
        const user_exist = await User('buyer').findById(userId)
        if(user_exist) {
            if(deleteItem) {
                    const user = await User('buyer').updateOne(
                        {
                            _id: userId
                        }, {
                            $pull: {
                                SearchData: deleteItem
                            }
                        }
                    )
                    if(user.modifiedCount > 0){
                        return res.status(200).json({ message: "search deleted" })
                    } else {
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
                    } else {
                        return res.status(200).json({ message: "Guess only" })
                    }
                }
            }
        }
    } catch (error) {
        console.error("Failed to push ", error)
    }
}
