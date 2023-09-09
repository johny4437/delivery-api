import { Customer, PrismaClient } from "@prisma/client";
import { CustomerData } from "../Interfaces/CustomerData";
import { PaymentData } from "../Interfaces/PaymentData";
import { SnackData } from "../Interfaces/SnackData";
import { Order } from "@prisma/client";

export default class CheckoutService {
    private prisma: PrismaClient
    constructor() {
        this.prisma = new PrismaClient()
    }
    async process(cart: SnackData[], customer: CustomerData, payment: PaymentData) {
        const snacks = await this.prisma.snack.findMany({
            where: {
                id: {
                    in: cart.map((snack) => snack.id)
                }
            }
        })

        // console.log("snacks", snacks)
        // Register client in DB
        const snacksInCart = snacks.map<SnackData>((snack) => ({
            ...snack,
            price: Number(snack.price),
            quantity: cart.find((item) => item.id === snack.id)?.quantity!,
            subTotal: cart.find((item) => item.id === snack.id)?.quantity! * Number(snack.price)
        }))
        // Register client in DB
        const customerCreated = await this.createCustomer(customer)

        console.log("customer", customerCreated)
        // Create order item
        // const orderItem = await this.createOrder(snacksInCart, customerCreated)


    }

    private async createCustomer(customer: CustomerData): Promise<CustomerData> {
        const customerCreated = await this.prisma.customer.upsert({
            where: {
                email: customer.email,
            },
            update: customer,
            create: customer
        })

        return customerCreated;
    }

    private async createOrder(snacksInCart: SnackData[], customer: Customer):Promise<Order> {

        const total = snacksInCart.reduce((acc, snack) => acc + snack.subTotal, 0);
        const order = await this.prisma.order.create({
            data: {
                total,
                customer: {
                    connect: { id: customer.id }
                },
                orderItems: {
                    createMany: {
                        data: snacksInCart.map((snack) => ({
                            snackId: snack.id,
                            snack: {
                                connect: { id: snack.id }
                            },
                            quantity: snack.quantity,
                            subTotal: snack.subTotal,

                        }))
                    }
                }
            },
            include: {
                customer: true, orderItems: { include: { snack: true } }
            }
        })
        return order
    }
}