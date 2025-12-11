import { useAuthStore } from "@/auth/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="container mx-auto px-4 lg:px-8">
      <h1 className="text-3xl font-bold my-6">
        Welcome back, {user?.name ?? "User"}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="text-2xl">Request Ride</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Get a ride to your destination quickly and safely.
            <div className="mt-4">
              <Button size="sm">Start ride request</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="text-2xl">Request Delivery</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Send packages with ease and reliability.
            <div className="mt-4">
              <Button size="sm" variant="secondary">
                Start delivery request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            No recent activity.
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Wallet Summary</h2>
        <Card>
          <CardContent className="p-4">
            <p className="text-lg">Balance: $0.00</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Dashboard;
