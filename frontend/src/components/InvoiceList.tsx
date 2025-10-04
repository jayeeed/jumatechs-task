import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invoiceApi } from "@/services/api";
import { Invoice } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { CreateInvoiceDialog } from "./CreateInvoiceDialog";
import { InvoiceDetailDialog } from "./InvoiceDetailDialog";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  paid: { label: "Paid", variant: "default" as const, className: "bg-success hover:bg-success" },
  pending: { label: "Pending", variant: "secondary" as const, className: "" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, className: "" },
};

export function InvoiceList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceApi.getInvoices,
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
            <p className="text-muted-foreground mt-1">
              Manage and track your sales invoices
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        {!invoices || invoices.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first invoice to get started
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice, index) => (
              <Card
                key={invoice.id}
                className="p-6 hover:shadow-lg transition-all animate-slide-up relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {invoice.reference_number}
                        </h3>
                        <Badge
                          variant={statusConfig[invoice.status].variant}
                          className={statusConfig[invoice.status].className}
                        >
                          {statusConfig[invoice.status].label}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{invoice.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.customer_email}
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Created: {formatDate(invoice.created_at)}</p>
                          <p>Last Updated: {formatDate(invoice.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(invoice.total_amount)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {invoice.items.length} item{invoice.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedInvoice && (
        <InvoiceDetailDialog
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedInvoice(null);
              refetch();
            }
          }}
        />
      )}
    </>
  );
}