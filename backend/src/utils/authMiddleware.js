import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next)=> {
    try{

        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json ({success: false, message: "Access denied. No token provided."});
        }
         const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user  = {userId: decodedToken.userId}; 
        next();
    }catch (error){
        console.error ("JWT verification failed:", error);
        res.status(401).json ({success: false, message: "Invalid/expired token"});
    }

   

};