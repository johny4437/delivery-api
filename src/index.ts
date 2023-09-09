import express, { Express, Request, Response } from "express";
import { config } from 'dotenv'
import { PrismaClient } from "@prisma/client";
import { SnackData } from "./Interfaces/SnackData";
import { CustomerData } from "./Interfaces/CustomerData";
import { PaymentData } from "./Interfaces/PaymentData";
import CheckoutService from "./Services/CheckoutServices";
config();

const app: Express = express();
app.use(express.json());
const prisma = new PrismaClient()

app.get('/snacks', async (req: Request, res: Response) => {
    const { snack } = req.query;

    if (!snack) return res.status(400).json({ message: "Snack is required" });

    const snacks = await prisma.snack.findMany({
        where: {
            snack: {
                equals: snack as string
            }
        }
    })
    return res.status(200).json(snacks);

})

// order router

app.get('/order/:id', async (req: Request, res: Response) => {
    const { id } = req.params;



    const order = await prisma.order.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!order) return res.status(400).json({ message: "Order not found" });
    return res.status(200).json(order);

})
// checkout order

interface CheckoutRequest extends  Request{
    body:{
        cart: SnackData[]
        customer: CustomerData
        paymentMethod: PaymentData
    }
}

app.post('/checkout', async (req: Request, res: Response) => {
   
const {cart, customer, paymentMethod} = req.body;
const checkoutService = new CheckoutService();

checkoutService.process( cart, customer, paymentMethod)
return res.status(200).json({message:"Checkout completed!!"})

})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("app is runnign on port", PORT);
})