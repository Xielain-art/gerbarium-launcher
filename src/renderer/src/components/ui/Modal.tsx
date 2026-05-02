import { useEffect, useCallback } from "react";
import { Button } from "./Button";
import { UI_STRINGS } from "../../../../shared/constants/ui-strings";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  closeOnBackdrop = true,
  showCloseButton = true,
}: ModalProps): React.JSX.Element | null {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEsc(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdrop && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative mx-4 w-full max-w-md border-[4px] border-b-[var(--mc-panel-border-lo)] border-l-[var(--mc-panel-border-hi)] border-r-[var(--mc-panel-border-lo)] border-t-[var(--mc-panel-border-hi)] bg-[var(--mc-panel-bg)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-[3px] border-theme p-4">
          <h2
            id="modal-title"
            className="font-minecraft text-lg font-bold uppercase text-theme"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center text-theme-muted transition-colors hover:text-theme"
              aria-label={UI_STRINGS.WINDOW_CONTROLS.CLOSE}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="square" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer Actions */}
        {actions && (
          <div className="flex gap-3 border-t-[3px] border-theme p-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalActions({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <div className="flex gap-3">{children}</div>;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = UI_STRINGS.COMMON.CONFIRM,
  cancelText = UI_STRINGS.COMMON.CANCEL,
  variant = "primary",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger";
}): React.JSX.Element | null {
  function handleConfirm(): void {
    onConfirm();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="font-minecraft text-sm text-theme">{message}</p>
    </Modal>
  );
}

