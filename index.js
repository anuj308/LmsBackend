import dotenv from "dotenv"
import morgan from "morgan";
import express  from "express";

dotenv.config();

const app = express()
const PORT = process.env.PORT

// logging middleware
if(process.env.NODE_ENV === "development"){
    app.use(morgan('dev'))
}

//Body Parser Middleware
app.use(express.json({limit:"10kb"}))
app.use(express.urlencoded({extended: true, limit:"10kb"}))

// Global Error Handler
app.use((err,req,res,next)=>{
    console.error(err.stack)
    res.status(err.stack || 500).json({
        status : "error",
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === "development" && {stack : err.stack})
    })
})

//Api routes

// 404 handler allway in botttom of code
app.use((req,res)=>{
    res.status(404).json({
        status : "error",
        message : "Route not found !!"
    })
})

app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT} in ${process.env.NODE_ENV} mode`)
})