import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { invoiceApi } from "@/services/api";
import { Invoice } from "@/types/invoice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowUpRight, CheckCircle, Clock, CreditCard, Pencil, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { EditInvoiceDialog } from "./EditInvoiceDialog";

const statusConfig = {
  paid: { label: "Paid", variant: "default" as const, className: "bg-success hover:bg-success" },
  pending: { label: "Pending", variant: "secondary" as const, className: "" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, className: "" },
};

// Define transaction status colors
const transactionStatusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-warning/10 text-warning" },
  completed: { label: "Completed", icon: CheckCircle, className: "bg-success/10 text-success" },
  paid: { label: "Paid", icon: CreditCard, className: "bg-primary/10 text-primary" },
};

export function InvoiceDetailDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(invoice);

  // Update currentInvoice when invoice prop changes
  useEffect(() => {
    setCurrentInvoice(invoice);
  }, [invoice]);

  const payMutation = useMutation({
    mutationFn: () => invoiceApi.payInvoice(invoice.id),
    onSuccess: (updatedInvoice) => {
      queryClient.setQueryData(["invoices"], (oldData: Invoice[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(inv => inv.id === invoice.id ? updatedInvoice : inv);
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setCurrentInvoice(updatedInvoice);
      toast({
        title: "Payment recorded",
        description: "The invoice has been marked as paid.",
      });
      // Close the modal after marking as paid
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markPendingMutation = useMutation({
    mutationFn: () => invoiceApi.markPending(invoice.id),
    onSuccess: (updatedInvoice) => {
      queryClient.setQueryData(["invoices"], (oldData: Invoice[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(inv => inv.id === invoice.id ? updatedInvoice : inv);
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setCurrentInvoice(updatedInvoice);
      toast({
        title: "Status updated",
        description: "The invoice has been marked as pending.",
      });
      // Close the modal after marking as pending
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => invoiceApi.deleteInvoice(invoice.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate transaction history based on current invoice status
  const generateTransactionHistory = () => {
    const history = [];
    
    // Add creation transaction
    history.push({
      id: 1,
      transaction_type: "sale" as const,
      amount: currentInvoice.total_amount,
      transaction_date: currentInvoice.created_at,
      status: "pending",
      description: "Sale created"
    });
    
    // Add payment transaction if invoice is paid
    if (currentInvoice.status === "paid") {
      history.push({
        id: 2,
        transaction_type: "payment" as const,
        amount: currentInvoice.total_amount,
        transaction_date: currentInvoice.updated_at,
        status: "completed",
        description: "Payment received"
      });
    }
    
    return history;
  };

  const transactionHistory = generateTransactionHistory();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">{currentInvoice.reference_number}</DialogTitle>
                <DialogDescription>Invoice details and transaction history</DialogDescription>
              </div>
              <Badge
                variant={statusConfig[currentInvoice.status].variant}
                className={statusConfig[currentInvoice.status].className}
              >
                {statusConfig[currentInvoice.status].label}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Customer Information
              </h3>
              <div className="space-y-1">
                <p className="font-medium">{currentInvoice.customer_name}</p>
                <p className="text-sm text-muted-foreground">{currentInvoice.customer_email}</p>
              </div>
            </div>

            <Separator />

            {/* Invoice Items */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Invoice Items
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentInvoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(item.total_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="space-y-2 pt-4">
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(currentInvoice.total_amount)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Transaction History */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Transaction History
              </h3>
              {transactionHistory && transactionHistory.length > 0 ? (
                <div className="space-y-2">
                  {transactionHistory.map((transaction) => {
                    const StatusIcon = transactionStatusConfig[transaction.status as keyof typeof transactionStatusConfig]?.icon || ArrowUpRight;
                    const statusConfig = transactionStatusConfig[transaction.status as keyof typeof transactionStatusConfig] || 
                      { label: transaction.status, className: "bg-primary/10 text-primary" };
                    
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${statusConfig.className}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">
                              {transaction.transaction_type === "sale" ? "Sale" : "Payment"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {statusConfig.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transaction.transaction_date)}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-lg">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 pb-8">
                  No transactions yet
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <Separator />
            <div className="flex justify-end gap-3">
              {currentInvoice.status === "pending" && (
                <Button
                  onClick={() => payMutation.mutate()}
                  disabled={payMutation.isPending || deleteMutation.isPending || markPendingMutation.isPending}
                  className="gap-2"
                >
                  {payMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Mark as Paid
                    </>
                  )}
                </Button>
              )}
              {currentInvoice.status === "paid" && (
                <Button
                  onClick={() => markPendingMutation.mutate()}
                  disabled={markPendingMutation.isPending || deleteMutation.isPending || payMutation.isPending}
                  className="gap-2"
                >
                  {markPendingMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Mark as Pending
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                disabled={deleteMutation.isPending || payMutation.isPending || markPendingMutation.isPending}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending || payMutation.isPending || markPendingMutation.isPending}
                className="gap-2"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
              <p>Created: {formatDate(currentInvoice.created_at)}</p>
              <p>Last Updated: {formatDate(currentInvoice.updated_at)}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditInvoiceDialog
        invoice={currentInvoice}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
}