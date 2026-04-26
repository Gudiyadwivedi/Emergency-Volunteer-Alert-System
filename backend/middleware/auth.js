import { apierror } from "../utils/apierror.js";
import { asynchandler } from "../utils/asynchandler.js"; 
import { User } from "../models/user.js";
import jwt from "jsonwebtoken"
export const verifyjwt=asynchandler(async(req,res,next)=>{
    // in THis process we taking the token and save it in verifyjwt
  // try {
     const token= req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
  // console.log(token)
     if(!token){
      throw new apierror(401,"Unauthorized request")
     }

  const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
  console.log(decodedToken)
  const user=await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
  )

  if(!user){
      throw new apierror(401,"envalid access token")
  }
  req.user=user;
  next()
 

})