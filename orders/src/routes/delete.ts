import express, { Request, Response} from 'express';
import { requireAuth, NotFoundError, UnauthorizedError } from '@sebsonic2o-org/common';
import { Order, OrderStatus } from '../models/order';

const router = express.Router();

router.delete(
  '/api/orders/:id',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    order.set({
      status: OrderStatus.Cancelled
    });

    await order.save();

    // publish order cancelled event

    res.status(204).send(order);
});

export { router as deleteOrderRouter };
