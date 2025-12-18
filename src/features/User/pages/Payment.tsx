import { Wallet } from "@/features/User/components/payments/payment-wallet";
import { Cards } from "@/features/User/components/payments/payment-cards";
import { Logs } from "@/features/User/components/payments/payment-logs";

const Payment = () => {
  return (
    <div className="container px-4 lg:px-8 mx-auto py-6">
      <h2 className="text-2xl font-semibold mb-4">Payment</h2>
      <Wallet />
      <Cards />
      <Logs />
    </div>
  );
};

export default Payment;
