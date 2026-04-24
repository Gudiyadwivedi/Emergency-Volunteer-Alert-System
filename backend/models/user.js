const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, required: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "volunteer", "admin"],
      default: "user",
    },

    // USER (Victim) fields
    medicalInfo: {
      bloodGroup: { type: String },
      diseases: { type: String },
      allergies: { type: String },
    },

    emergencyContacts: [
      {
        name: String,
        phone: String,
        relation: String,
      },
    ],

    // VOLUNTEER fields
    verified: { type: Boolean, default: false },

    available: { type: Boolean, default: true },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);



// IMPORTANT: Geo Index for nearby volunteer search
userSchema.index({ location: "2dsphere" });



userSchema.pre("save", async function(next){

    //  if(!this.isModified("password")) return next()
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10)
next()}

})

userSchema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password)
    
}

userSchema.methods.generatetokenAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


module.exports = mongoose.model("User", userSchema);