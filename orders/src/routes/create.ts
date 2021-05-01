import express, { Request, Response} from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@sebsonic2o-org/common';

const router = express.Router();

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
    res.send({});
});

export { router as createOrderRouter };
