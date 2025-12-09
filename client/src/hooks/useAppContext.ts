'use client';

// ===== USE APP CONTEXT - HOOK ДЛЯ ДОСТУПА К КОНТЕКСТУ =====

import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

/**
 * Hook для удобного доступа к AppContext
 *
 * @example
 * const { state, dispatch } = useAppContext();
 * console.log(state.workspace.name); // 'SkinClinic'
 * dispatch({ type: 'SET_WORKSPACE', payload: { workspaceId: 'mt' } });
 */
export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }

  return context;
}

/**
 * Hook для получения только состояния (без dispatch)
 */
export function useAppState() {
  const { state } = useAppContext();
  return state;
}

/**
 * Hook для получения только dispatch
 */
export function useAppDispatch() {
  const { dispatch } = useAppContext();
  return dispatch;
}
