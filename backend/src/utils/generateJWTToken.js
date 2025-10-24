import jwt from 'jsonwebtoken';

export const generateJWTToken = (res, userId) => {
  
    const secret = process.env.JWT_SECRET;
    if(!secret) throw new Error("JWT_SECRET is not defined");


    const token = jwt.sign({ userId }, process.env.JWT_SECRET,{
        expiresIn: "7d"
    })

    res.cookie('token', token, {
        httpOnly: true, //cookie can't be accessed by client side scripts
        secure: process.env.NODE_ENV === 'production', //cookie only secure when we have https
        sameSite: 'strict', //cookie will only be set on same site
        maxAge: 7 * 24 * 60 * 60 *1000  //7 days
    })

    return token;
}

