import express, { Request, Response} from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, BadRequestError } from '@sebsonic2o-org/common';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .notEmpty()
      .withMessage('Ticket id must be supplied')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // find ticket to order
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }

    // verify ticket is not reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // set expiration for order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build and save order
    const order = Order.build({
      userId: req.currentUser!.id,
      expiresAt: expiration,
      ticket
    });

    await order.save();

    // publish order created event
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      expiresAt: order.expiresAt.toISOString(), // to be time zone agnostic (utc)
      userId: order.userId,
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    });

    res.status(201).send(order);
});

export { router as createOrderRouter };
