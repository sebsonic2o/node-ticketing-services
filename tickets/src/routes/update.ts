import express, { Request, Response} from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, BadRequestError, UnauthorizedError } from '@sebsonic2o-org/common';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title must be supplied'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Ticket is reserved and cannot be edited');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price
    });

    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId
    });

    res.send(ticket);
});

export { router as updateTicketRouter };
