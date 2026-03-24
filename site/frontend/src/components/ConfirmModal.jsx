import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ConfirmModal({ open, onOpenChange, title, description, onConfirm, onCancel }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[var(--bg-surface)] border border-[var(--bg-border)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--text-primary)]">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--text-muted)]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="bg-[var(--bg-base)] border-[var(--bg-border)] text-[var(--text-primary)] hover:bg-[var(--bg-border)]"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
