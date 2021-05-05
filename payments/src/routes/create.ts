import mongoose from 'mongoose';
import express, { Request, Response} from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, UnauthorizedError, BadRequestError } from '@sebsonic2o-org/common';
import { Order, OrderStatus } from '../models/order';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token')
      .notEmpty()
      .withMessage('Token must be supplied'),
    body('orderId')
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Order id must be supplied')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order is cancelled and cannot be paid for');
    }

    res.status(201).send({});
});

export { router as createChargeRouter };
