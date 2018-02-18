import { IAddress } from "./address";
import { IProduct } from "./product";

export class IOrder {
  customerId: string;
  customerEmail: string;
  customerAddress: IAddress;

  reference: string;

  Package: IProduct;
  adults: number;
  children: number;
  customerPaid: number;

  paymentState: string;
  paymentType: string;

  arrivalDate: string;
  arrivalTime: string;

  paymentId: string;
}
