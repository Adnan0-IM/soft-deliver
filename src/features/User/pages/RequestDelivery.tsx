import DeliveryRequest from "../components/delivery-request";

const RequestDelivery = () => {
  return (
    <div className="container px-4 lg:px-8 mx-auto py-6">
      <h2 className="text-2xl font-semibold mb-4">Request a Delivery</h2>
      <DeliveryRequest />
    </div>
  );
};

export default RequestDelivery;
