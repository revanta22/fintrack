"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { Transaction, Asset } from "./types";
import { mockTransactions, mockAssets } from "./mockData";

// ── State ──────────────────────────────────────────────────
interface State {
  transactions: Transaction[];
  assets: Asset[];
}

const initial: State = {
  transactions: mockTransactions,
  assets: mockAssets,
};

// ── Actions ────────────────────────────────────────────────
type Action =
  | { type: "ADD_TX";    payload: Transaction }
  | { type: "UPDATE_TX"; payload: Transaction }
  | { type: "DELETE_TX"; payload: string }
  | { type: "ADD_ASSET";    payload: Asset }
  | { type: "UPDATE_ASSET"; payload: Asset }
  | { type: "DELETE_ASSET"; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TX":
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case "UPDATE_TX":
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TX":
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case "ADD_ASSET":
      return { ...state, assets: [action.payload, ...state.assets] };
    case "UPDATE_ASSET":
      return {
        ...state,
        assets: state.assets.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case "DELETE_ASSET":
      return { ...state, assets: state.assets.filter(a => a.id !== action.payload) };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────
interface CtxValue {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const Ctx = createContext<CtxValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useFinance() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}

// ── Helpers ────────────────────────────────────────────────
export function fmt(v: number) {
  return "Rp " + Math.round(v).toLocaleString("id-ID");
}

export function monthLabel(date: Date) {
  return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}
