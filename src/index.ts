import  express,{Express, Request, Response} from "express";
import {config} from 'dotenv'

config();

const server: Express =  express();
server.use(express.json());

const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=>{
    console.log("Server is runnign on port", PORT);
})