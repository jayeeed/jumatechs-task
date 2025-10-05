import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi } from "@/services/api";
import { Invoice } from "@/types/invoice";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteInvoiceDialog({
  invoice,
  open,
  onOpenChange,
  onDeleted,
}: DeleteInvoiceDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => invoiceApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted successfully.",
      });
      onOpenChange(false);
      if (onDeleted) {
        onDeleted();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (invoice) {
      deleteMutation.mutate(invoice.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-destructive/10 rounded-full">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            {invoice && (
              <>
                Are you sure you want to delete invoice <span className="font-semibold">{invoice.reference_number}</span>? 
                This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This will permanently delete the invoice and all associated data. Please confirm you want to proceed.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
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
                Delete Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}