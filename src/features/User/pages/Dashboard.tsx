
import { useAuthStore } from "@/auth/store";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  
  return (
    <main className="container mx-auto px-4 lg:px-8">
      <h1 className="text-3xl font-bold my-6">Welcome back, {user?.name ?? "User"}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center hover:bg-blue-600 cursor-pointer">
          <h2 className="text-2xl font-semibold mb-4">Request Ride</h2>
          <p className="text-center">
            Get a ride to your destination quickly and safely.
          </p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center hover:bg-green-600 cursor-pointer">
          <h2 className="text-2xl font-semibold mb-4">Request Delivery</h2>
          <p className="text-center">
            Send packages with ease and reliability.
          </p>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <ul className="space-y-4">
          {/* Placeholder for recent activities */}
          <li className="p-4 bg-secondary rounded-lg shadow">
            No recent activity.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Wallet Summary</h2>
        <div className="p-4 bg-secondary rounded-lg shadow">
          <p className="text-lg">Balance: $0.00</p>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
