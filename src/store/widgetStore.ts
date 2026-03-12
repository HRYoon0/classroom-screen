import { useReducer, useCallback, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import type { WidgetData, WidgetType } from '../types/widget';
import { WIDGET_META } from '../constants';

// 위젯 상태 액션 타입
type Action =
  | { type: 'ADD'; widgetType: WidgetType }
  | { type: 'REMOVE'; id: string }
  | { type: 'UPDATE'; id: string; data: Partial<WidgetData> }
  | { type: 'UPDATE_CONFIG'; id: string; config: Record<string, unknown> }
  | { type: 'BRING_TO_FRONT'; id: string }
  | { type: 'LOAD'; widgets: WidgetData[] };

function getMaxZ(widgets: WidgetData[]) {
  return widgets.reduce((max, w) => Math.max(max, w.zIndex), 0);
}

function reducer(state: WidgetData[], action: Action): WidgetData[] {
  switch (action.type) {
    case 'ADD': {
      const meta = WIDGET_META[action.widgetType];
      const newWidget: WidgetData = {
        id: uuid(),
        type: action.widgetType,
        x: 100 + Math.random() * 200,
        y: 80 + Math.random() * 100,
        w: meta.defaultW,
        h: meta.defaultH,
        zIndex: getMaxZ(state) + 1,
        config: {},
      };
      return [...state, newWidget];
    }
    case 'REMOVE':
      return state.filter((w) => w.id !== action.id);
    case 'UPDATE':
      return state.map((w) =>
        w.id === action.id ? { ...w, ...action.data } : w
      );
    case 'UPDATE_CONFIG':
      return state.map((w) =>
        w.id === action.id
          ? { ...w, config: { ...w.config, ...action.config } }
          : w
      );
    case 'BRING_TO_FRONT': {
      const maxZ = getMaxZ(state);
      const target = state.find((w) => w.id === action.id);
      if (target && target.zIndex === maxZ) return state;
      return state.map((w) =>
        w.id === action.id ? { ...w, zIndex: maxZ + 1 } : w
      );
    }
    case 'LOAD':
      return action.widgets;
    default:
      return state;
  }
}

// 로컬 스토리지 키
const STORAGE_KEY = 'classboard-widgets';
const BG_STORAGE_KEY = 'classboard-bg';
const CANVAS_VERSION_KEY = 'classboard-canvas-version';
const VIRTUAL_WIDTH = 1920;
const VIRTUAL_HEIGHT = 1080;

// 옛날 픽셀 좌표 → 가상 캔버스 좌표로 1회 변환
function migrateToVirtualCanvas(widgets: WidgetData[]): WidgetData[] {
  if (widgets.length === 0) return widgets;
  if (localStorage.getItem(CANVAS_VERSION_KEY) === '2') return widgets;

  const scaleX = VIRTUAL_WIDTH / window.innerWidth;
  const scaleY = VIRTUAL_HEIGHT / window.innerHeight;

  const migrated = widgets.map((w) => ({
    ...w,
    x: w.x * scaleX,
    y: w.y * scaleY,
    w: w.w * scaleX,
    h: w.h * scaleY,
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
  localStorage.setItem(CANVAS_VERSION_KEY, '2');
  return migrated;
}

function loadWidgets(): WidgetData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const widgets: WidgetData[] = JSON.parse(raw);
    return migrateToVirtualCanvas(widgets);
  } catch {
    return [];
  }
}

export function loadBackground(): string {
  return localStorage.getItem(BG_STORAGE_KEY) || '';
}

export function saveBackground(bg: string) {
  localStorage.setItem(BG_STORAGE_KEY, bg);
}

export function useWidgetStore() {
  const [widgets, dispatch] = useReducer(reducer, [], loadWidgets);

  // 상태가 변경될 때마다 로컬 스토리지에 저장
  const saveToStorage = useCallback((ws: WidgetData[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ws));
  }, []);

  const addWidget = useCallback(
    (widgetType: WidgetType) => {
      dispatch({ type: 'ADD', widgetType });
    },
    []
  );

  const removeWidget = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const updateWidget = useCallback(
    (id: string, data: Partial<WidgetData>) => {
      dispatch({ type: 'UPDATE', id, data });
    },
    []
  );

  const updateConfig = useCallback(
    (id: string, config: Record<string, unknown>) => {
      dispatch({ type: 'UPDATE_CONFIG', id, config });
    },
    []
  );

  const bringToFront = useCallback((id: string) => {
    dispatch({ type: 'BRING_TO_FRONT', id });
  }, []);

  // 위젯 변경 시 자동 저장 (useEffect로 렌더 후 비동기 저장)
  const saveTimerRef = useRef<number>(0);
  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    }, 300);
  }, [widgets]);

  const loadAll = useCallback((ws: WidgetData[]) => {
    dispatch({ type: 'LOAD', widgets: ws });
  }, []);

  return {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    updateConfig,
    bringToFront,
    saveToStorage,
    loadAll,
  };
}
