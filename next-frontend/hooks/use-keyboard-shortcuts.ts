'use client';

import React, { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  target?: EventTarget | null;
}

export interface UseKeyboardShortcutsReturn {
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
  getShortcuts: () => KeyboardShortcut[];
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
}

/**
 * Hook for managing global keyboard shortcuts in the band availability system.
 * Includes common shortcuts for refresh, undo, save, etc.
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[] = [],
  options: UseKeyboardShortcutsOptions = {}
): UseKeyboardShortcutsReturn {
  const { enabled = true, target = typeof window !== 'undefined' ? document : null } = options;
  
  // Create a unique key for a shortcut (stable function)
  const getShortcutKey = useCallback((shortcut: KeyboardShortcut): string => {
    const modifiers = [];
    if (shortcut.ctrlKey) modifiers.push('ctrl');
    if (shortcut.metaKey) modifiers.push('meta');
    if (shortcut.shiftKey) modifiers.push('shift');
    if (shortcut.altKey) modifiers.push('alt');
    return `${modifiers.join('+')}-${shortcut.key.toLowerCase()}`;
  }, []);
  
  const [isEnabled, setIsEnabled] = React.useState(enabled);
  const [registeredShortcuts, setRegisteredShortcuts] = React.useState<Map<string, KeyboardShortcut>>(() => 
    new Map(shortcuts.map(s => {
      const modifiers = [];
      if (s.ctrlKey) modifiers.push('ctrl');
      if (s.metaKey) modifiers.push('meta');
      if (s.shiftKey) modifiers.push('shift');
      if (s.altKey) modifiers.push('alt');
      const key = `${modifiers.join('+')}-${s.key.toLowerCase()}`;
      return [key, s];
    }))
  );
  
  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;
    
    // Don't trigger shortcuts when user is typing in form fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return;
    }
    
    const shortcutKey = getShortcutKey({
      key: event.key,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      action: () => {},
      description: ''
    });
    
    const shortcut = registeredShortcuts.get(shortcutKey);
    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      shortcut.action();
    }
  }, [isEnabled, registeredShortcuts, getShortcutKey]);
  
  // Register event listener
  useEffect(() => {
    if (!target || !isEnabled) return;
    
    target.addEventListener('keydown', handleKeyDown as EventListener);
    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [target, isEnabled, handleKeyDown]);
  
  // Register a new shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const key = getShortcutKey(shortcut);
    setRegisteredShortcuts(prev => new Map(prev).set(key, shortcut));
  }, [getShortcutKey]);
  
  // Unregister a shortcut
  const unregisterShortcut = useCallback((key: string) => {
    setRegisteredShortcuts(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);
  
  // Get all registered shortcuts
  const getShortcuts = useCallback(() => {
    return Array.from(registeredShortcuts.values());
  }, [registeredShortcuts]);
  
  // Enable shortcuts
  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);
  
  // Disable shortcuts
  const disable = useCallback(() => {
    setIsEnabled(false);
  }, []);
  
  return {
    registerShortcut,
    unregisterShortcut,
    getShortcuts,
    isEnabled,
    enable,
    disable,
  };
}

/**
 * Hook that provides pre-configured keyboard shortcuts for the band availability system.
 */
export function useBandKeyboardShortcuts(actions: {
  refresh?: () => void;
  undo?: () => void;
  save?: () => void;
  toggleUser?: () => void;
  openHelp?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [];
  
  if (actions.refresh) {
    shortcuts.push({
      key: 'r',
      ctrlKey: true,
      action: actions.refresh,
      description: 'Refresh data',
    });
    shortcuts.push({
      key: 'r',
      metaKey: true,
      action: actions.refresh,
      description: 'Refresh data (Mac)',
    });
  }
  
  if (actions.undo) {
    shortcuts.push({
      key: 'z',
      ctrlKey: true,
      action: actions.undo,
      description: 'Undo last action',
    });
    shortcuts.push({
      key: 'z',
      metaKey: true,
      action: actions.undo,
      description: 'Undo last action (Mac)',
    });
  }
  
  if (actions.save) {
    shortcuts.push({
      key: 's',
      ctrlKey: true,
      action: actions.save,
      description: 'Save changes',
    });
    shortcuts.push({
      key: 's',
      metaKey: true,
      action: actions.save,
      description: 'Save changes (Mac)',
    });
  }
  
  if (actions.toggleUser) {
    shortcuts.push({
      key: 'u',
      ctrlKey: true,
      shiftKey: true,
      action: actions.toggleUser,
      description: 'Toggle user selection',
    });
    shortcuts.push({
      key: 'u',
      metaKey: true,
      shiftKey: true,
      action: actions.toggleUser,
      description: 'Toggle user selection (Mac)',
    });
  }
  
  if (actions.openHelp) {
    shortcuts.push({
      key: '?',
      action: actions.openHelp,
      description: 'Show keyboard shortcuts help',
      preventDefault: false,
    });
  }
  
  return useKeyboardShortcuts(shortcuts);
}
