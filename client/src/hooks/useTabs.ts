'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Tab {
  id: string;
  title: string;
  icon: string;
  type: 'sheets' | 'drive-folder' | 'doc' | 'cosmetic-dashboard';
  url: string;
  projectId?: string;
  linkId?: string;
}

const STORAGE_KEY = 'business-os-tabs';
const MAX_TABS = 10;

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Load tabs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { tabs: storedTabs, activeTabId: storedActiveTabId } = JSON.parse(stored);
        setTabs(storedTabs);
        setActiveTabId(storedActiveTabId);
      } catch (error) {
        console.error('Failed to load tabs from localStorage:', error);
      }
    }
  }, []);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTabId }));
    }
  }, [tabs, activeTabId]);

  const openTab = useCallback((tab: Tab) => {
    setTabs((prevTabs) => {
      // Check if tab already exists
      const existingTab = prevTabs.find((t) => t.id === tab.id);
      if (existingTab) {
        // Just switch to it
        setActiveTabId(tab.id);
        return prevTabs;
      }

      // Check max tabs limit
      if (prevTabs.length >= MAX_TABS) {
        alert(`Максимум ${MAX_TABS} вкладок. Закройте одну, чтобы открыть новую.`);
        return prevTabs;
      }

      // Add new tab
      setActiveTabId(tab.id);
      return [...prevTabs, tab];
    });
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter((t) => t.id !== tabId);

      // If closing active tab, switch to the last tab
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }

      return newTabs;
    });
  }, [activeTabId]);

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs((prevTabs) => {
      const newTabs = [...prevTabs];
      const [removed] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, removed);
      return newTabs;
    });
  }, []);

  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;

  return {
    tabs,
    activeTab,
    activeTabId,
    openTab,
    closeTab,
    switchTab,
    reorderTabs,
    closeAllTabs,
  };
}
