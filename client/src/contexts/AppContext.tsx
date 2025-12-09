'use client';

// ===== APP CONTEXT - ГЛОБАЛЬНОЕ СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====

import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import type {
  AppContextState,
  AppContextAction,
  Tab,
  Workspace,
  WorkspaceId,
  DocumentContext,
} from '../types/context';
import projectsConfig from '../config/projects.json';
import tabsConfig from '../config/tabs.config.json';

// ===== INITIAL STATE =====

const getDefaultWorkspace = (): Workspace => {
  const project = projectsConfig.projects[0];
  return {
    id: project.id as WorkspaceId,
    name: project.name,
    shortName: project.shortName,
    icon: project.icon,
    color: project.color,
    theme: project.theme,
  };
};

const initialState: AppContextState = {
  workspace: getDefaultWorkspace(),
  activeTab: null,
  tabs: [],
  navigationHistory: [],
  currentHistoryIndex: -1,
};

// ===== REDUCER =====

function appContextReducer(
  state: AppContextState,
  action: AppContextAction
): AppContextState {
  switch (action.type) {
    case 'SET_WORKSPACE': {
      const { workspaceId } = action.payload;
      const project = projectsConfig.projects.find((p) => p.id === workspaceId);

      if (!project) {
        console.error(`Workspace ${workspaceId} not found`);
        return state;
      }

      const newWorkspace: Workspace = {
        id: project.id as WorkspaceId,
        name: project.name,
        shortName: project.shortName,
        icon: project.icon,
        color: project.color,
        theme: project.theme,
      };

      return {
        ...state,
        workspace: newWorkspace,
        // При смене workspace сбрасываем активную вкладку
        activeTab: null,
      };
    }

    case 'OPEN_TAB': {
      const { tab } = action.payload;

      // Проверяем, не открыта ли уже эта вкладка
      const existingTab = state.tabs.find((t) => t.id === tab.id);

      if (existingTab) {
        // Вкладка уже открыта, просто делаем её активной
        return {
          ...state,
          activeTab: existingTab,
        };
      }

      // Добавляем новую вкладку
      const newTabs = [...state.tabs, tab];

      // Ограничение: максимум 10 открытых вкладок
      const limitedTabs = newTabs.slice(-10);

      return {
        ...state,
        tabs: limitedTabs,
        activeTab: tab,
      };
    }

    case 'CLOSE_TAB': {
      const { tabId } = action.payload;
      const newTabs = state.tabs.filter((t) => t.id !== tabId);

      // Если закрываем активную вкладку, делаем активной предыдущую
      let newActiveTab = state.activeTab;
      if (state.activeTab?.id === tabId) {
        newActiveTab = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
      }

      return {
        ...state,
        tabs: newTabs,
        activeTab: newActiveTab,
      };
    }

    case 'SET_ACTIVE_TAB': {
      const { tabId } = action.payload;
      const tab = state.tabs.find((t) => t.id === tabId);

      if (!tab) {
        console.error(`Tab ${tabId} not found`);
        return state;
      }

      return {
        ...state,
        activeTab: tab,
      };
    }

    case 'UPDATE_DOCUMENT_CONTEXT': {
      const { tabId, context } = action.payload;

      // Обновляем контекст в массиве вкладок
      const newTabs = state.tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, documentContext: context }
          : tab
      );

      // Обновляем активную вкладку если это она
      const newActiveTab =
        state.activeTab?.id === tabId
          ? { ...state.activeTab, documentContext: context }
          : state.activeTab;

      return {
        ...state,
        tabs: newTabs,
        activeTab: newActiveTab,
      };
    }

    case 'UPDATE_TAB': {
      const { tabId, updates } = action.payload;

      // Обновляем вкладку в массиве
      const newTabs = state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, ...updates } : tab
      );

      // Обновляем активную вкладку если это она
      const newActiveTab =
        state.activeTab?.id === tabId
          ? { ...state.activeTab, ...updates }
          : state.activeTab;

      return {
        ...state,
        tabs: newTabs,
        activeTab: newActiveTab,
      };
    }

    default:
      return state;
  }
}

// ===== CONTEXT =====

interface AppContextValue {
  state: AppContextState;
  dispatch: React.Dispatch<AppContextAction>;
}

export const AppContext = createContext<AppContextValue>({
  state: initialState,
  dispatch: () => null,
});

// ===== PROVIDER =====

interface AppContextProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [state, dispatch] = useReducer(appContextReducer, initialState);

  // Сохранение состояния в localStorage (опционально)
  useEffect(() => {
    try {
      const savedWorkspace = localStorage.getItem('businessos_workspace');
      if (savedWorkspace) {
        dispatch({
          type: 'SET_WORKSPACE',
          payload: { workspaceId: savedWorkspace as WorkspaceId },
        });
      }
    } catch (error) {
      console.error('Error loading saved workspace:', error);
    }
  }, []);

  // Сохранение текущего workspace в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('businessos_workspace', state.workspace.id);
    } catch (error) {
      console.error('Error saving workspace:', error);
    }
  }, [state.workspace.id]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
