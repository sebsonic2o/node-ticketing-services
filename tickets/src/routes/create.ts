import express, { Request, Response} from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@sebsonic2o-org/common';

const router = express.Router();

router.post(
  '/api/tickets',
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
    res.status(201).send({});
});

export { router as createTicketRouter };
