import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi } from "@/services/api";
import { Invoice, CreateInvoiceRequest } from "@/types/invoice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface InvoiceItemInput {
  id?: number;
  description: string;
  quantity: string;
  unit_price: string;
}

export function EditInvoiceDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [referenceNumber, setReferenceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState<InvoiceItemInput[]>([]);

  // Initialize form with invoice data
  useEffect(() => {
    if (invoice) {
      // Remove the "{username}INV-" prefix when editing to show just the number part
      const username = user?.username || "USER";
      const prefix = `${username}INV-`;
      const cleanReferenceNumber = invoice.reference_number.replace(new RegExp(`^${prefix}`), "");
      setReferenceNumber(cleanReferenceNumber);
      setCustomerName(invoice.customer_name);
      setCustomerEmail(invoice.customer_email);
      setItems(
        invoice.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity.toString(),
          unit_price: item.unit_price,
        }))
      );
    }
  }, [invoice, user]);

  const updateMutation = useMutation({
    mutationFn: (data: CreateInvoiceRequest) => 
      invoice && invoiceApi.updateInvoice(invoice.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully.",
      });
      handleClose();
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
    mutationFn: () => invoice && invoiceApi.deleteInvoice(invoice.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted successfully.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: "1", unit_price: "0" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItemInput,
    value: string
  ) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    (item[field] as string) = value;
    newItems[index] = item;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      return sum + quantity * unitPrice;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!referenceNumber || !customerName || !customerEmail) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (items.some((item) => !item.description)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all item descriptions.",
        variant: "destructive",
      });
      return;
    }

    // Format the reference number to ensure it has "{username}INV-" prefix
    const username = user?.username || "USER";
    const formattedReferenceNumber = `${username}INV-${referenceNumber}`;

    const request: CreateInvoiceRequest = {
      reference_number: formattedReferenceNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      items: items.map((item) => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        unit_price: item.unit_price,
      })),
    };

    updateMutation.mutate(request);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const subtotal = calculateTotal();
  const total = subtotal;

  if (!invoice) return null;

  // Get username for prefix display
  const username = user?.username || "USER";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Modify the details of invoice {invoice.reference_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Invoice Information</h3>
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">
                Invoice Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="prefix"
                  value={`${username}INV-`}
                  disabled
                  className="w-24"
                />
                <Input
                  id="referenceNumber"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="001"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">
                  Customer Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Invoice Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 p-4 border rounded-lg bg-muted/30"
              >
                <div className="col-span-5 space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    placeholder="Item description"
                    required
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor={`quantity-${index}`}>Qty</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                  <Input
                    id={`unitPrice-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(index, "unit_price", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending || updateMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>

                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Invoice"
              )}
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateMutation.isPending || deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending || deleteMutation.isPending}>
                {updateMutation.isPending ? (
                  <>

                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Invoice"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}