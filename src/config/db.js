const mongoose= require('mongoose')

const dbConnect=async()=>{
try {
await mongoose.connect(process.env.MONGO_URL)
console.log("Db connected success!!!")
    
} catch (error) {
    console.log("Error while connecting Db",error)
}
}

module.exports={
    dbConnect
}