import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { NotificationItem } from "./notifications";
import { Spinner } from "@/components/ui/spinner";

const ScrollAreaC = ({
  filtered,
  markAsRead,
  loading,
  error,
}: {
  filtered: NotificationItem[];
  markAsRead: (id: string) => void;
  loading: boolean;
  error: string | null;
}) => {
  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }
  return (
    <ScrollArea className="h-[560px] ">
      <div className="p-1 grid gap-2">
        {filtered.map((n) => (
          <Card key={n.id} className={n.read ? "bg-muted/30 gap-2" : " gap-2"}>
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <Badge variant={n.type === "promo" ? "secondary" : "default"}>
                  {n.type}
                </Badge>
                {!n.read && (
                  <span className="ml-auto text-xs text-primary">New</span>
                )}
              </div>
              <CardTitle className="text-sm sm:text-base">{n.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:px-6  pt-0 text-sm sm:text-base text-muted-foreground">
              <div className="mb-2">{n.body}</div>
              <div className="flex items-center gap-2 text-xs">
                <div>{new Date(n.createdAt).toLocaleString()}</div>
                {!n.read && (
                  <Button
                    size="sm"
                    className="ml-auto text-xs sm:text-base"
                    onClick={() => markAsRead(n.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ScrollAreaC;
