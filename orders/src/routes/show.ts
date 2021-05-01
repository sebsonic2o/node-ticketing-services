import express, { Request, Response} from 'express';
import { requireAuth, NotFoundError, UnauthorizedError } from '@sebsonic2o-org/common';
import { Order } from '../models/order';

const router = express.Router();

router.get(
  '/api/orders/:id',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(
      req.params.id
    ).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    res.send(order);
});

export { router as showOrderRouter };
