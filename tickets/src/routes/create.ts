import express, { Request, Response} from 'express';
import { requireAuth } from '@sebsonic2o-org/common';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  async (req: Request, res: Response) => {
    res.status(201).send({});
});

export { router as createTicketRouter };
