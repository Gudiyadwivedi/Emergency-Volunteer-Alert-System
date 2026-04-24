import mongoose from "mongoose";


const database=async()=>{
    try {
       const a= mongoose.connect(`${process.env.URL}/project`)
       console.log("database is connected successfully")
// console.log(a.connection.host)
    } catch (error) {
        console.log("mongodb connection fail",error)
        // throw error;
    }
}

export {database}