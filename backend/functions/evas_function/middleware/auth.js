//  import { apierror } from "../utils/apierror.js";
// import { asynchandler } from "../utils/asynchandler.js"; 
// import { User } from "../models/user.js";
// import jwt from "jsonwebtoken"
// // export const verifyjwt=asynchandler(async(req,res,next)=>{
// //     // in THis process we taking the token and save it in verifyjwt
// //   // try {
// //      const token= req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
// //      if(!token){
// //       throw new apierror(401,"Unauthorized request")
// //      }
// //   const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
// //    const user=await User.findById(decodedToken?._id).select(
// //       "-password -refreshToken"
// //   )
// //   if(!user){
// //       throw new apierror(401,"envalid access token")
// //   }
// //   req.user=user;
// //   next()
 

// // })

// export const verifyjwt = asynchandler(async (req, res, next) => {
//   const token =
//     req.cookies?.accessToken ||
//     req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     throw new apierror(401, "Unauthorized request");
//   }

//   let decodedToken;
//   try {
//     decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//   } catch (error) {
//     throw new apierror(401, "Invalid or expired token");
//   }

//   const user = await User.findById(decodedToken?._id).select(
//     // "-password -refreshToken"
//   );

//   if (!user) {
//     throw new apierror(401, "Invalid access token");
//   }

//   req.user = user;
//   next();
// });