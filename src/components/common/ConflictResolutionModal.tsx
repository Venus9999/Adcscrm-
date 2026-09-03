import React, { useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';

/**
 * ConflictResolutionModal
 * Automatically merges local working data with remote database changes
 * without interrupting the user or prompting repeatedly.
 */
export const ConflictResolutionModal: React.FC = () => {
  const { conflictInfo, resolveConflict } = useCRM();

  useEffect(() => {
    if (conflictInfo) {
      // Always automatically merge both datasets non-destructively
      resolveConflict('merge').catch((err) => {
        console.error('Auto-merge conflict resolution error:', err);
      });
    }
  }, [conflictInfo, resolveConflict]);

  // Suppress modal dialog to avoid prompting the user
  return null;
};
