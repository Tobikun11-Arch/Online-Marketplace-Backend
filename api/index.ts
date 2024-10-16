import dotenv from 'dotenv';
import ProtectedRoutes from '../routes/protectedRoutes';
import connectToMongoDB from '../config/db'; 
import express, {Request, Response} from 'express'
import verificationRoutes from '../routes/verificationRoutes'; 
import UserRoutes from '../routes/userRoutes'; 
import authRoute from '../routes/authRoutes'; 
import cookieParser from 'cookie-parser';

dotenv.config(); 
const app = express();
const cors = require('cors');

const corsOptions = {
    origin: ['http://localhost:3000', 'https://online-marketplace-beta.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


app.use(express.json());
app.use(cookieParser());

connectToMongoDB()
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit if the connection fails
    });

app.use('/api/users', UserRoutes);
app.use('/api', ProtectedRoutes);
app.use('/', verificationRoutes); 

app.get("/", (req: Request, res: Response) => res.send("Express on Vercelss"));
app.get("/home", (req: Request, res: Response) => res.send("Gumana tanga"));


module.exports = app;