import React from 'react';

type ConfirmModalProps = {
    isOpen: boolean;
    title?: string;
    message?: string;
    children?: React.ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    showCancel?: boolean;
};

const ConfirmModal = ({
    isOpen,
    title,
    message,
    children,
    onConfirm,
    onCancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    showCancel = true,
}: ConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative z-10 w-full max-w-xl p-6">
                <div className="card p-6">
                    {title && <div className="text-xl font-bold mb-2">{title}</div>}
                    {message && <div className="mb-4 text-sm text-gray-700">{message}</div>}
                    {children}

                    <div className="mt-4 flex justify-end gap-3">
                        {showCancel && (
                            <button
                                className="px-4 py-2 border rounded bg-white"
                                onClick={() => onCancel && onCancel()}
                            >
                                {cancelLabel}
                            </button>
                        )}
                        <button
                            className={
                                'px-4 py-2 rounded text-white ' +
                                (danger ? 'btn-danger' : 'bg-linear-65 from-[var(--primary)] to-[var(--muted)]')
                            }
                            onClick={onConfirm}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
