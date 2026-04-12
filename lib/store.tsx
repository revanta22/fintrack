"use client";

import {
  createContext, useContext, useReducer,
  useEffect, ReactNode, useCallback,
} from "react";
import { Transaction, Asset } from "./types";
import { supabase } from "./supabase";

// ── State ──────────────────────────────────────────────────
interface State {
  transactions: Transaction[];
  assets: Asset[];
  loading: boolean;
}

const initial: State = { transactions: [], assets: [], loading: true };

// ── Actions ────────────────────────────────────────────────
type Action =
  | { type: "SET_TX";       payload: Transaction[] }
  | { type: "SET_ASSETS";   payload: Asset[] }
  | { type: "ADD_TX";       payload: Transaction }
  | { type: "UPDATE_TX";    payload: Transaction }
  | { type: "DELETE_TX";    payload: string }
  | { type: "ADD_ASSET";    payload: Asset }
  | { type: "UPDATE_ASSET"; payload: Asset }
  | { type: "DELETE_ASSET"; payload: string }
  | { type: "SET_LOADING";  payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TX":      return { ...state, transactions: action.payload, loading: false };
    case "SET_ASSETS":  return { ...state, assets: action.payload };
    case "SET_LOADING": return { ...state, loading: action.payload };
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
  // Transactions
  addTx:    (tx: Omit<Transaction, "id">) => Promise<void>;
  updateTx: (tx: Transaction) => Promise<void>;
  deleteTx: (id: string) => Promise<void>;
  // Assets
  addAsset:    (a: Omit<Asset, "id">) => Promise<void>;
  updateAsset: (a: Asset) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

const Ctx = createContext<CtxValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // ── Fetch all data on mount ──────────────────────────────
  useEffect(() => {
    async function load() {
      dispatch({ type: "SET_LOADING", payload: true });

      const [{ data: txData }, { data: assetData }] = await Promise.all([
        supabase.from("transactions").select("*").order("date", { ascending: false }),
        supabase.from("assets").select("*").order("created_at", { ascending: false }),
      ]);

      dispatch({ type: "SET_TX",     payload: (txData    as Transaction[]) ?? [] });
      dispatch({ type: "SET_ASSETS", payload: (assetData as Asset[])       ?? [] });
    }
    load();
  }, []);

  // ── Transaction actions ──────────────────────────────────
  const addTx = useCallback(async (tx: Omit<Transaction, "id">) => {
    const newTx: Transaction = { id: "t" + Date.now(), ...tx };
    dispatch({ type: "ADD_TX", payload: newTx });
    await supabase.from("transactions").insert(newTx);
  }, []);

  const updateTx = useCallback(async (tx: Transaction) => {
    dispatch({ type: "UPDATE_TX", payload: tx });
    await supabase.from("transactions").update(tx).eq("id", tx.id);
  }, []);

  const deleteTx = useCallback(async (id: string) => {
    dispatch({ type: "DELETE_TX", payload: id });
    await supabase.from("transactions").delete().eq("id", id);
  }, []);

  // ── Asset actions ────────────────────────────────────────
  const addAsset = useCallback(async (a: Omit<Asset, "id">) => {
    const newAsset: Asset = { id: "a" + Date.now(), ...a };
    dispatch({ type: "ADD_ASSET", payload: newAsset });
    await supabase.from("assets").insert(newAsset);
  }, []);

  const updateAsset = useCallback(async (a: Asset) => {
    dispatch({ type: "UPDATE_ASSET", payload: a });
    await supabase.from("assets").update(a).eq("id", a.id);
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    dispatch({ type: "DELETE_ASSET", payload: id });
    await supabase.from("assets").delete().eq("id", id);
  }, []);

  return (
    <Ctx.Provider value={{
      state,
      addTx, updateTx, deleteTx,
      addAsset, updateAsset, deleteAsset,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}

export function fmt(v: number) {
  return "Rp " + Math.round(v).toLocaleString("id-ID");
}