import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { HistoryItem } from "./history";
import { useNavigate } from "react-router";

const HistoryTable = ({
  filtered,
  loading,
  error,
}: {
  filtered: HistoryItem[];
  loading: boolean;
  error: string | null;
}) => {
  const navigate = useNavigate();
  const viewReceipt = (id: string) => {
    navigate(`/user/receipt/${id}`);
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-sm text-destructive">{error}</div>;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your trips</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile list */}
        <div className="md:hidden grid gap-2 p-2 pt-0">
          {filtered.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">${i.cost.toFixed(2)}</div>
                  <Badge
                    variant={
                      i.status === "completed"
                        ? "default"
                        : i.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {i.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="mt-1 text-muted-foreground">
                  {new Date(i.date).toLocaleString()}
                </div>
                <div className="mt-1 capitalize">{i.type}</div>
                <div className="mt-2">
                  <div className="truncate">
                    <span className="text-muted-foreground">From:</span>{" "}
                    {i.from}
                  </div>
                  <div className="truncate">
                    <span className="text-muted-foreground">To:</span> {i.to}
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" onClick={() => viewReceipt(i.id)}>
                    View Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(i.date).toLocaleString()}
                  </TableCell>
                  <TableCell className="capitalize">{i.type}</TableCell>
                  <TableCell>{i.from}</TableCell>
                  <TableCell>{i.to}</TableCell>
                  <TableCell>${i.cost.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">
                    <Badge
                      variant={
                        i.status === "completed"
                          ? "default"
                          : i.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {i.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => viewReceipt(i.id)}>
                      View Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryTable;
