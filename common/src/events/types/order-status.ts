export enum OrderStatus {
  Created = 'created', // order created but ticket not reserved
  Cancelled = 'cancelled', // ticket for order already reserved, or order cancelled/expired
  AwaitingPayment = 'awaiting:payment', // ticket successfully reserved for order
  Complete = 'complete' // ticket for order reserved with successful payment
}
