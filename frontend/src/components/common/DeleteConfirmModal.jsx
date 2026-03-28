import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// DELETE CONFIRMATION MODAL
// Premium confirmation dialog with entity-aware messaging.
// Shows a centered modal overlay with smooth animations.
// ═══════════════════════════════════════════════════════════════

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, entityName, entityType }) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal-card" onClick={e => e.stopPropagation()}>
        {/* Icon */}
        <div className="delete-modal-icon-wrap">
          <div className="delete-modal-icon">
            <i className="fas fa-trash-alt"></i>
          </div>
        </div>

        {/* Title */}
        <h3 className="delete-modal-title">Delete {entityType || 'Entity'}?</h3>

        {/* Entity name */}
        {entityName && (
          <div className="delete-modal-entity">
            <i className="fas fa-tag" style={{ fontSize: 10, opacity: 0.7 }}></i>
            <span>{entityName}</span>
          </div>
        )}

        {/* Warning message */}
        <p className="delete-modal-text">
          This action is <strong>permanent</strong> and cannot be undone.
          All associated data will be removed.
        </p>

        {/* Warning banner */}
        <div className="delete-modal-warning">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Are you sure you want to proceed?</span>
        </div>

        {/* Actions */}
        <div className="delete-modal-actions">
          <button
            className="delete-modal-btn-cancel"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="delete-modal-btn-delete"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: 11 }}></i>
                Deleting...
              </>
            ) : (
              <>
                <i className="fas fa-trash-alt" style={{ fontSize: 11 }}></i>
                Yes, Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
