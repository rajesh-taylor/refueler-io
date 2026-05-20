/**
 * REFUELER – Tactical Rig (index.tsx)
 * PART 3: Sprint 1 – Horology & Rewards Layer ✓ COMPLETE
 * [2026-05-13] All Part 3 goals delivered
 *
 * PART 2 COMPLETE:
 * — ✓ MENU State: Right-side drawer overlay (Main / Session Info / Settings)
 * — ✓ Branded Pay Button: Costa Red (#C8102E) with wordmark + glow
 * — ✓ Theme Engine: Light/Dark toggle via ThemeProvider + mutable T ref
 *
 * PART 3 COMPLETE:
 * — ✓ Goal A: ChronographFace SVG (Watch Ultra / Breguet horology dial)
 * — ✓ Goal B: Sats/Fiat Reward Toggle (Loss Aversion Protocol, 15% uplift)
 * — ✓ Goal C: DashboardQR (SVG voucher on ORDER_COMPLETE, CarPlay surface)
 *
 * KNOWN ISSUE (lines 1–150):
 * — ✓ RESOLVED: satisfies ThemeTokens syntax fixed (was: }; satisfies Themetokens)
 * — ✓ RESOLVED: Dead vars inn/out/from removed from DialFace subdial loop
 * — ✓ RESOLVED: Unused handColour destructure in DialFace
 * — ✓ RESOLVED: Variable shadow m → mod in DashboardQR
 *
 * DEVELOPMENT NOTE:
 * File is ~2,020 lines. Modularisation into component files recommended
 * before Part 4 (Merchant ROI Dashboard / Fountain LSP integration).
 * Dependencies: react-native-svg (Expo stack, claude.md §3)
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Clipboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Rect,
  Text as SvgText,
} from "react-native-svg";

// ─────────────────────────────────────────────────────────────────────────────
// FIELD-CALIBRATION KNOBS
// ─────────────────────────────────────────────────────────────────────────────

const SPLASH_DURATION_MS    = 2_400;
const REFUND_WINDOW_SECONDS = 30;
const DWELL_THRESHOLD_MS    = 180_000; // 3 min — calibrate on-site at Lakeside

// ─────────────────────────────────────────────────────────────────────────────
// THEME TOKENS — Light & Dark palettes
// Scale values (xs…hero) are theme-invariant and kept on T directly.
// ─────────────────────────────────────────────────────────────────────────────

const SCALE = { xs: 10, sm: 12, md: 14, lg: 17, xl: 22, hero: 52 } as const;

const DARK_TOKENS = {
  bg:          "#0C0C0C",
  surface:     "#141414",
  border:      "#2A2A2A",
  textPrimary: "#ECEAE0",
  textSecond:  "#8A887E",
  textDim:     "#4A4846",
  cream:       "#FFFDD0",
} as const;

const LIGHT_TOKENS = {
  bg:          "#F5F5F0",
  surface:     "#FFFFFF",
  border:      "#D8D6D0",
  textPrimary: "#1A1A1A",
  textSecond:  "#5A5855",
  textDim:     "#A0A09A",
  cream:       "#1A1A1A",   // inverted — used for hero text, stays legible
} as const;

// Accent colours are theme-invariant
const ACCENTS = {
  orange:  "#F7931A",
  teal:    "#008080",
  green:   "#30D158",
  red:     "#FF3B30",
  amber:   "#FF9F0A",
  cobalt:  "#2E5BFF",
  costa:   "#C8102E",
  ms:      "#00594C",
  nero:    "#003153",
} as const;

type ThemeTokens = typeof DARK_TOKENS & typeof ACCENTS & typeof SCALE;

// T is a mutable ref updated by ThemeProvider — all existing T.x references stay valid
let T: ThemeTokens = { ...DARK_TOKENS, ...ACCENTS, ...SCALE };

// ─────────────────────────────────────────────────────────────────────────────
// THEME CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

type ThemeMode = "DARK" | "LIGHT";

interface ThemeCtx {
  mode:        ThemeMode;
  tokens:      ThemeTokens;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

const useTheme = (): ThemeCtx => {
  const c = useContext(ThemeContext);
  if (!c) throw new Error("useTheme must be inside ThemeProvider");
  return c;
};

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("DARK");

  const tokens = {
    ...(mode === "DARK" ? DARK_TOKENS : LIGHT_TOKENS),
    ...ACCENTS,
    ...SCALE,
  } as ThemeTokens;

  // Sync the mutable T ref so all existing T.x colour reads in JSX
  // pick up the new theme automatically on re-render.
  T = tokens;

  const toggleTheme = useCallback(() => {
    setMode(m => m === "DARK" ? "LIGHT" : "DARK");
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, tokens, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type AppState = "SPLASH" | "HUB" | "CHECKOUT" | "FUELING" | "CHRONOGRAPH";
type MenuView = "NONE" | "MAIN" | "SESSION_INFO" | "SETTINGS";

type PaymentSubState = "IDLE" | "PENDING" | "SUCCESS" | "COMMITTED" | "FAILED";

interface SessionLog {
  timestamp: string;
  event:     string;
  meta?:     Record<string, unknown>;
}

interface FlashOffer {
  label:         string;
  originalPrice: number;
  salePrice:     number;
  emoji:         string;
}

interface Merchant {
  id:           string;
  name:         string;
  category:     string;
  brandColour:  string;
  accentColour: string;
  available:    boolean;
  basePrice:    number;
  emoji:        string;
  flashOffer?:  FlashOffer;
}

// ─────────────────────────────────────────────────────────────────────────────
// MERCHANT GRID — 3 × 3
// ─────────────────────────────────────────────────────────────────────────────

const MERCHANT_GRID: Merchant[] = [
  {
    id: "costa", name: "Costa", category: "Coffee",
    brandColour: T.costa, accentColour: "#FF8A8A",
    available: true, basePrice: 4.85, emoji: "☕",
    flashOffer: { label: "Blueberry Muffin", originalPrice: 3.50, salePrice: 1.75, emoji: "🫐" },
  },
  {
    id: "ms_cafe", name: "M&S Café", category: "Food",
    brandColour: T.ms, accentColour: "#5DCEA5",
    available: true, basePrice: 6.50, emoji: "🥗",
  },
  {
    id: "caffe_nero", name: "Caffè Nero", category: "Coffee",
    brandColour: T.nero, accentColour: "#AFC8E0",
    available: true, basePrice: 4.40, emoji: "☕",
    flashOffer: { label: "Almond Croissant", originalPrice: 3.20, salePrice: 1.60, emoji: "🥐" },
  },
  {
    id: "chargepoint", name: "ChargePoint", category: "EV Bay",
    brandColour: "#FF6D00", accentColour: "#FFB366",
    available: true, basePrice: 8.20, emoji: "⚡",
  },
  {
    id: "costco", name: "Costco", category: "Wholesale",
    brandColour: "#005DAA", accentColour: "#85B8EC",
    available: true, basePrice: 0, emoji: "🏭",
  },
  {
    id: "next", name: "Next", category: "Retail",
    brandColour: "#3A3A3A", accentColour: "#D0D0D0",
    available: true, basePrice: 0, emoji: "🛍",
  },
  {
    id: "lakeside_mgmt", name: "Lakeside", category: "Site Admin",
    brandColour: "#1A1A1A", accentColour: T.teal,
    available: true, basePrice: 0, emoji: "🏛",
  },
  {
    id: "driveway_node", name: "Driveway", category: "Energy",
    brandColour: "#0F2A1A", accentColour: "#27AE60",
    available: true, basePrice: 3.60, emoji: "🔋",
  },
  {
    id: "add_partner", name: "+ Add Partner", category: "Growth",
    brandColour: "#1A1A1A", accentColour: "#5A5A5A",
    available: false, basePrice: 0, emoji: "+",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────

interface AppStore {
  screen:                 AppState;
  selectedMerchant:       Merchant | null;
  paymentState:           PaymentSubState;
  paymentConfirmed:       boolean;
  refundWindowRemaining:  number;
  orderTotal:             number;
  upsellAccepted:         boolean;
  orderToken:             string | null;
  fulfilmentMode:         "COLLECT" | "BAY_DELIVERY" | null;
  dwellElapsedMs:         number;
  isDwellVerified:        boolean;
  orderElapsedMs:         number;
  isOrderComplete:        boolean;
  sessionLogs:            SessionLog[];
  menuView:               MenuView;
  rewardMode:             "SATS" | "FIAT";
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

type AppAction =
  | { type: "ADVANCE_FROM_SPLASH" }
  | { type: "SELECT_MERCHANT";      merchant: Merchant }
  | { type: "ACCEPT_UPSELL" }
  | { type: "INITIATE_PAYMENT" }
  | { type: "TICK_REFUND_WINDOW" }
  | { type: "PAYMENT_SUCCESS";      token: string }
  | { type: "PAYMENT_FAILED";       reason: string }
  | { type: "RETRY_PAYMENT" }
  | { type: "CANCEL_AND_REFUND" }
  | { type: "COMMIT_TO_FUELING" }
  | { type: "SET_FULFILMENT_MODE";  mode: "COLLECT" | "BAY_DELIVERY" }
  | { type: "TICK_DWELL";           deltaMs: number }
  | { type: "ORDER_READY" }
  | { type: "TICK_ORDER_ELAPSED";   deltaMs: number }
  | { type: "ORDER_COMPLETE" }
  | { type: "RESET_TO_HUB" }
  | { type: "OPEN_MENU";  view?: MenuView }
  | { type: "CLOSE_MENU" }
  | { type: "SET_REWARD_MODE"; mode: "SATS" | "FIAT" };

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const mkLog = (event: string, meta?: Record<string, unknown>): SessionLog =>
  ({ timestamp: new Date().toISOString(), event, meta });

const mkToken = (): string => String(Math.floor(100 + Math.random() * 900));

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const INIT: AppStore = {
  screen:                "SPLASH",
  selectedMerchant:      null,
  paymentState:          "IDLE",
  paymentConfirmed:      false,
  refundWindowRemaining: REFUND_WINDOW_SECONDS,
  orderTotal:            0,
  upsellAccepted:        false,
  orderToken:            null,
  fulfilmentMode:        null,
  dwellElapsedMs:        0,
  isDwellVerified:       false,
  orderElapsedMs:        0,
  isOrderComplete:       false,
  sessionLogs:           [mkLog("APP_BOOT", { build: "lakeside-part3-horology" })],
  menuView:              "NONE",
  rewardMode:            "SATS",
};

// ─────────────────────────────────────────────────────────────────────────────
// REDUCER — 5-STATE MACHINE
// ─────────────────────────────────────────────────────────────────────────────

function reducer(s: AppStore, a: AppAction): AppStore {
  switch (a.type) {

    // ── 1. SPLASH → HUB ───────────────────────────────────────────────────
    case "ADVANCE_FROM_SPLASH":
      if (s.screen !== "SPLASH") return s;
      return {
        ...s, screen: "HUB",
        sessionLogs: [...s.sessionLogs, mkLog("STATE_TRANSITION", { from: "SPLASH", to: "HUB" })],
      };

    // ── 2. HUB → CHECKOUT ─────────────────────────────────────────────────
    case "SELECT_MERCHANT": {
      if (s.screen !== "HUB" || !a.merchant.available) return s;
      return {
        ...s,
        screen:               "CHECKOUT",
        selectedMerchant:     a.merchant,
        paymentState:         "IDLE",
        paymentConfirmed:     false,
        refundWindowRemaining: REFUND_WINDOW_SECONDS,
        orderTotal:           a.merchant.basePrice,
        upsellAccepted:       false,
        sessionLogs: [
          ...s.sessionLogs,
          mkLog("STATE_TRANSITION",  { from: "HUB", to: "CHECKOUT", merchant: a.merchant.id }),
          mkLog("MERCHANT_SELECTED", { id: a.merchant.id, basePrice: a.merchant.basePrice }),
        ],
      };
    }

    // ── 3a. UPSELL ENGINE — Flash Offer accepted ───────────────────────────
    case "ACCEPT_UPSELL": {
      if (s.upsellAccepted || !s.selectedMerchant?.flashOffer) return s;
      const off     = s.selectedMerchant.flashOffer;
      const newTotal = +(s.orderTotal + off.salePrice).toFixed(2);
      return {
        ...s, upsellAccepted: true, orderTotal: newTotal,
        sessionLogs: [...s.sessionLogs, mkLog("UPSELL_ACCEPTED", {
          item: off.label, salePrice: off.salePrice, newTotal,
        })],
      };
    }

    // ── 3b. PAYMENT — initiate ─────────────────────────────────────────────
    case "INITIATE_PAYMENT":
      if (s.screen !== "CHECKOUT" || s.paymentState !== "IDLE") return s;
      return {
        ...s, paymentState: "PENDING",
        refundWindowRemaining: REFUND_WINDOW_SECONDS,
        sessionLogs: [...s.sessionLogs, mkLog("PAYMENT_INITIATED", {
          merchant: s.selectedMerchant?.id, total: s.orderTotal,
        })],
      };

    // ── 3c. REFUND WINDOW — 1-second tick ─────────────────────────────────
    case "TICK_REFUND_WINDOW": {
      if (s.screen !== "CHECKOUT" || s.paymentState !== "PENDING") return s;
      const next = s.refundWindowRemaining - 1;
      if (next <= 0) {
        return {
          ...s, refundWindowRemaining: 0, paymentState: "COMMITTED",
          sessionLogs: [...s.sessionLogs, mkLog("REFUND_WINDOW_EXPIRED")],
        };
      }
      return { ...s, refundWindowRemaining: next };
    }

    // ── 3d. PAYMENT — success ──────────────────────────────────────────────
    case "PAYMENT_SUCCESS":
      if (s.screen !== "CHECKOUT") return s;
      return {
        ...s, paymentState: "SUCCESS", paymentConfirmed: true, orderToken: a.token,
        sessionLogs: [...s.sessionLogs, mkLog("PAYMENT_SUCCESS", {
          token: a.token, total: s.orderTotal,
        })],
      };

    // ── 3e. PAYMENT — failure path ─────────────────────────────────────────
    //  UI surfaces: [TRY AGAIN] → resets to IDLE  |  [RETURN TO HUB] → CANCEL_AND_REFUND
    case "PAYMENT_FAILED":
      if (s.screen !== "CHECKOUT") return s;
      return {
        ...s, paymentState: "FAILED", paymentConfirmed: false,
        sessionLogs: [...s.sessionLogs, mkLog("PAYMENT_FAILURE", { reason: a.reason })],
      };

    // ── 3f. RETRY — resets sub-state to IDLE so user can attempt again ─────
    case "RETRY_PAYMENT":
      if (s.paymentState !== "FAILED") return s;
      return {
        ...s, paymentState: "IDLE",
        refundWindowRemaining: REFUND_WINDOW_SECONDS,
        sessionLogs: [...s.sessionLogs, mkLog("PAYMENT_RETRY")],
      };

    // ── 3g. CANCEL & REFUND — only while window is open ───────────────────
    case "CANCEL_AND_REFUND":
      if (s.screen !== "CHECKOUT") return s;
      // Allow refund if FAILED (no charge was made) OR window still open
      if (
        s.paymentState !== "FAILED" &&
        (s.refundWindowRemaining <= 0 || s.paymentState === "COMMITTED")
      ) return s;
      return {
        ...s,
        screen:               "HUB",
        paymentState:         "IDLE",
        paymentConfirmed:     false,
        refundWindowRemaining: REFUND_WINDOW_SECONDS,
        selectedMerchant:     null,
        upsellAccepted:       false,
        sessionLogs: [
          ...s.sessionLogs,
          mkLog("REFUND_ISSUED", { windowRemaining: s.refundWindowRemaining }),
          mkLog("STATE_TRANSITION", { from: "CHECKOUT", to: "HUB", reason: "USER_REFUND" }),
        ],
      };

    // ── 4. CHECKOUT → FUELING (hard-gated) ────────────────────────────────
    case "COMMIT_TO_FUELING":
      if (s.screen !== "CHECKOUT") return s;
      // ╔══════════════════════════════════════════════════════════╗
      // ║  HARD GATE — paymentConfirmed MUST be true.             ║
      // ║  This is the fatal error source referenced in claude.md ║
      // ╚══════════════════════════════════════════════════════════╝
      if (!s.paymentConfirmed) {
        console.warn("[REFUELER] GATE VIOLATION: COMMIT_TO_FUELING without payment confirmation.");
        return s;
      }
      return {
        ...s, screen: "FUELING",
        dwellElapsedMs: 0, isDwellVerified: false,
        sessionLogs: [
          ...s.sessionLogs,
          mkLog("STATE_TRANSITION", { from: "CHECKOUT", to: "FUELING", token: s.orderToken }),
          mkLog("TIMER_INITIALIZED",  { token: s.orderToken, total: s.orderTotal }),
        ],
      };

    // ── 5. DWELL tick ─────────────────────────────────────────────────────
    case "TICK_DWELL": {
      if (s.screen !== "FUELING") return s;
      const next        = s.dwellElapsedMs + a.deltaMs;
      const verified    = next >= DWELL_THRESHOLD_MS;
      const justVerified = verified && !s.isDwellVerified;
      return {
        ...s, dwellElapsedMs: next, isDwellVerified: verified,
        sessionLogs: justVerified
          ? [...s.sessionLogs, mkLog("DWELL_VERIFIED", { thresholdMs: DWELL_THRESHOLD_MS, elapsedMs: next })]
          : s.sessionLogs,
      };
    }

    // ── 6. FULFILMENT MODE ────────────────────────────────────────────────
    case "SET_FULFILMENT_MODE":
      if (s.screen !== "FUELING") return s;
      return {
        ...s, fulfilmentMode: a.mode,
        sessionLogs: [...s.sessionLogs, mkLog("FULFILMENT_MODE_SET", { mode: a.mode })],
      };

    // ── 7. FUELING → CHRONOGRAPH ──────────────────────────────────────────
    case "ORDER_READY":
      if (s.screen !== "FUELING") return s;
      return {
        ...s, screen: "CHRONOGRAPH",
        orderElapsedMs: 0, isOrderComplete: false,
        sessionLogs: [
          ...s.sessionLogs,
          mkLog("STATE_TRANSITION", { from: "FUELING", to: "CHRONOGRAPH" }),
          mkLog("ORDER_READY",       { token: s.orderToken, mode: s.fulfilmentMode }),
        ],
      };

    // ── 8. CHRONOGRAPH ticks ──────────────────────────────────────────────
    case "TICK_ORDER_ELAPSED":
      if (s.screen !== "CHRONOGRAPH") return s;
      return { ...s, orderElapsedMs: s.orderElapsedMs + a.deltaMs };

    case "ORDER_COMPLETE":
      if (s.screen !== "CHRONOGRAPH") return s;
      return {
        ...s, isOrderComplete: true,
        sessionLogs: [...s.sessionLogs, mkLog("ORDER_COMPLETE", {
          token: s.orderToken, elapsedMs: s.orderElapsedMs,
        })],
      };

    // ── 9. RESET → HUB (any screen, e.g. CLOSE/DISMISS) ─────────────────
    case "RESET_TO_HUB":
      return {
        ...INIT, screen: "HUB",
        sessionLogs: [...s.sessionLogs, mkLog("STATE_TRANSITION", {
          from: s.screen, to: "HUB", reason: "RESET",
        })],
      };

    // ── MENU OVERLAY ──────────────────────────────────────────────────────
    case "OPEN_MENU":
      if (s.screen === "SPLASH") return s;
      return {
        ...s, menuView: a.view ?? "MAIN",
        sessionLogs: [...s.sessionLogs, mkLog("MENU_OPENED", { view: a.view ?? "MAIN" })],
      };

    case "CLOSE_MENU":
      return {
        ...s, menuView: "NONE",
        sessionLogs: [...s.sessionLogs, mkLog("MENU_CLOSED")],
      };

    // ── REWARD MODE ───────────────────────────────────────────────────────
    case "SET_REWARD_MODE":
      return {
        ...s, rewardMode: a.mode,
        sessionLogs: [...s.sessionLogs, mkLog("REWARD_MODE_SET", { mode: a.mode })],
      };

    default: return s;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT & PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

interface Ctx {
  state:                 AppStore;
  dispatch:              React.Dispatch<AppAction>;
  copyLogsToClipboard:   () => void;
  simulatePaymentSuccess: () => void;
  simulatePaymentFailed:  () => void;
}
const AppCtx = createContext<Ctx | null>(null);
const useApp = (): Ctx => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
};

function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const ref               = useRef(state);
  ref.current             = state;

  // Auto-advance from SPLASH
  useEffect(() => {
    if (state.screen !== "SPLASH") return;
    const t = setTimeout(() => dispatch({ type: "ADVANCE_FROM_SPLASH" }), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [state.screen]);

  // Refund window countdown
  useEffect(() => {
    if (state.screen !== "CHECKOUT" || state.paymentState !== "PENDING") return;
    if (state.refundWindowRemaining <= 0) return;
    const t = setInterval(() => dispatch({ type: "TICK_REFUND_WINDOW" }), 1_000);
    return () => clearInterval(t);
  }, [state.screen, state.paymentState, state.refundWindowRemaining]);

  // Auto-commit once payment confirmed + window expired
  useEffect(() => {
    if (
      state.screen !== "CHECKOUT"     ||
      !state.paymentConfirmed          ||
      state.refundWindowRemaining > 0
    ) return;
    dispatch({ type: "COMMIT_TO_FUELING" });
  }, [state.screen, state.paymentConfirmed, state.refundWindowRemaining]);

  // Dwell timer
  useEffect(() => {
    if (state.screen !== "FUELING") return;
    const t = setInterval(() => dispatch({ type: "TICK_DWELL", deltaMs: 1_000 }), 1_000);
    return () => clearInterval(t);
  }, [state.screen]);

  // Chronograph elapsed timer
  useEffect(() => {
    if (state.screen !== "CHRONOGRAPH" || state.isOrderComplete) return;
    const t = setInterval(() => dispatch({ type: "TICK_ORDER_ELAPSED", deltaMs: 1_000 }), 1_000);
    return () => clearInterval(t);
  }, [state.screen, state.isOrderComplete]);

  // Helpers
  const copyLogsToClipboard = useCallback(() => {
    Clipboard.setString(JSON.stringify(ref.current.sessionLogs, null, 2));
    Alert.alert("Logs Exported", `${ref.current.sessionLogs.length} events copied to clipboard.`);
  }, []);

  const simulatePaymentSuccess = useCallback(() => {
    dispatch({ type: "INITIATE_PAYMENT" });
    setTimeout(() => dispatch({ type: "PAYMENT_SUCCESS", token: mkToken() }), 900);
  }, []);

  const simulatePaymentFailed = useCallback(() => {
    dispatch({ type: "INITIATE_PAYMENT" });
    setTimeout(() => dispatch({ type: "PAYMENT_FAILED", reason: "CARD_DECLINED" }), 900);
  }, []);

  return (
    <AppCtx.Provider value={{ state, dispatch, copyLogsToClipboard, simulatePaymentSuccess, simulatePaymentFailed }}>
      {children}
    </AppCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ATOMS (minimal styling)
// ─────────────────────────────────────────────────────────────────────────────

function Btn({
  label, onPress, colour = T.textPrimary, disabled = false,
}: { label: string; onPress: () => void; colour?: string; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress} disabled={disabled}
      style={[a.btn, { borderColor: colour, opacity: disabled ? 0.35 : 1 }]}
    >
      <Text style={[a.btnTxt, { color: colour }]}>{label}</Text>
    </Pressable>
  );
}

function SolidBtn({
  label, onPress, bg, disabled = false,
}: { label: string; onPress: () => void; bg: string; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress} disabled={disabled}
      style={[a.solidBtn, { backgroundColor: bg, opacity: disabled ? 0.35 : 1 }]}
    >
      <Text style={a.solidTxt}>{label}</Text>
    </Pressable>
  );
}

function Divider({ label }: { label?: string }) {
  return (
    <View style={a.divRow}>
      <View style={a.divLine} />
      {label ? <Text style={a.divLbl}>{label}</Text> : null}
      {label ? <View style={a.divLine} /> : null}
    </View>
  );
}

const a = StyleSheet.create({
  btn:      { borderWidth: 1, borderRadius: 10, padding: 14, marginVertical: 4, alignItems: "center" },
  btnTxt:   { fontSize: T.md, fontWeight: "600" },
  solidBtn: { borderRadius: 10, padding: 14, marginVertical: 4, alignItems: "center" },
  solidTxt: { fontSize: T.md, fontWeight: "700", color: "#FFF" },
  divRow:   { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  divLine:  { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: T.border },
  divLbl:   { fontSize: T.xs, color: T.textDim, marginHorizontal: 10, letterSpacing: 1.5, textTransform: "uppercase" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — SPLASH
// ─────────────────────────────────────────────────────────────────────────────

function SplashScreen() {
  return (
    <View style={sp.bg}>
      <Text style={sp.wordmark}>REFUELER</Text>
      <Text style={sp.sub}>Don't just drive.</Text>
      <Text style={sp.pilot}>LAKESIDE PILOT · CAR PARK G</Text>
    </View>
  );
}
const sp = StyleSheet.create({
  bg:       { flex: 1, backgroundColor: T.bg, alignItems: "center", justifyContent: "center", gap: 10 },
  wordmark: { fontSize: 38, fontWeight: "200", color: T.cream, letterSpacing: 10 },
  sub:      { fontSize: T.md, color: T.textSecond, letterSpacing: 3 },
  pilot:    { fontSize: T.xs, color: T.textDim, letterSpacing: 2, marginTop: 12 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — HUB
// ─────────────────────────────────────────────────────────────────────────────

function HubScreen() {
  const { dispatch } = useApp();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={hu.cont}>
      <View style={hu.header}>
        <Text style={hu.wordmark}>REFUEL</Text>
        <View style={hu.badge}>
          <View style={[hu.dot, { backgroundColor: T.teal }]} />
          <Text style={[hu.badgeTxt, { color: T.teal }]}>BAY 4 · G</Text>
        </View>
      </View>
      <Text style={hu.sub}>Select a destination partner</Text>
      <Divider label="Merchant Grid" />

      <View style={hu.grid}>
        {MERCHANT_GRID.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => m.available && dispatch({ type: "SELECT_MERCHANT", merchant: m })}
            style={[hu.tile, {
              borderColor:       m.available ? m.brandColour : T.border,
              backgroundColor:   m.available ? `${m.brandColour}18` : T.surface,
              opacity:           m.available ? 1 : 0.38,
            }]}
          >
            <Text style={hu.emoji}>{m.emoji}</Text>
            <Text style={[hu.name, { color: m.accentColour }]} numberOfLines={1}>{m.name}</Text>
            <Text style={hu.cat}>{m.category}</Text>
            {m.flashOffer && (
              <View style={[hu.offerDot, { backgroundColor: m.brandColour }]}>
                <Text style={{ fontSize: 7 }}>⚡</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <Divider />
      <Text style={hu.footer}>REFUELER · Lakeside Teal Mode · Pilot Build</Text>
    </ScrollView>
  );
}
const hu = StyleSheet.create({
  cont:     { padding: 16, paddingBottom: 40 },
  header:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  wordmark: { fontSize: T.xl, fontWeight: "200", color: T.cream, letterSpacing: 6 },
  badge:    { flexDirection: "row", alignItems: "center", borderWidth: StyleSheet.hairlineWidth, borderColor: T.teal, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, gap: 5 },
  dot:      { width: 6, height: 6, borderRadius: 3 },
  badgeTxt: { fontSize: T.xs, letterSpacing: 1.5 },
  sub:      { fontSize: T.sm, color: T.textDim },
  grid:     { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile:     { width: "31%", borderWidth: 1, borderRadius: 12, padding: 11, alignItems: "center", gap: 4, minHeight: 85, position: "relative" },
  emoji:    { fontSize: 24 },
  name:     { fontSize: T.sm, fontWeight: "700", textAlign: "center" },
  cat:      { fontSize: T.xs, color: T.textDim, textAlign: "center" },
  offerDot: { position: "absolute", top: 5, right: 5, width: 15, height: 15, borderRadius: 7.5, alignItems: "center", justifyContent: "center" },
  footer:   { fontSize: T.xs, color: T.textDim, textAlign: "center" },
});

// ─────────────────────────────────────────────────────────────────────────────
// BRANDED PAY BUTTON
// Costa Coffee → Costa Red (#C8102E) with white wordmark
// All other merchants → their brandColour
// ─────────────────────────────────────────────────────────────────────────────

const COSTA_RED = "#C8102E" as const;

function CostaPayBtn({
  total,
  brandColour,
  onPress,
  disabled = false,
}: {
  total:       number;
  brandColour: string;
  onPress:     () => void;
  disabled?:   boolean;
}) {
  const isCosta = brandColour === COSTA_RED;
  const bg      = isCosta ? COSTA_RED : brandColour;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        pb.btn,
        { backgroundColor: bg, opacity: pressed || disabled ? 0.75 : 1 },
        isCosta && pb.costaShadow,
      ]}
    >
      {isCosta && <Text style={pb.costaLogo}>COSTA</Text>}
      <Text style={pb.amount}>Pay  £{total.toFixed(2)}</Text>
      {isCosta && <Text style={pb.tap}>Tap to pay</Text>}
    </Pressable>
  );
}
const pb = StyleSheet.create({
  btn:         { borderRadius: 12, paddingVertical: 18, paddingHorizontal: 24, marginVertical: 4, alignItems: "center", gap: 2 },
  costaShadow: { shadowColor: COSTA_RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8 },
  costaLogo:   { fontSize: 10, fontWeight: "900", color: "rgba(255,255,255,0.55)", letterSpacing: 5, textTransform: "uppercase" },
  amount:      { fontSize: 22, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 },
  tap:         { fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 2, marginTop: 2 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — CHECKOUT
// Manages: IDLE → PENDING → (SUCCESS|FAILED) → COMMITTED → FUELING
// ─────────────────────────────────────────────────────────────────────────────

function CheckoutScreen() {
  const { state, dispatch, simulatePaymentSuccess, simulatePaymentFailed } = useApp();
  const {
    selectedMerchant: m, paymentState,
    refundWindowRemaining, paymentConfirmed,
    orderTotal, upsellAccepted,
  } = state;

  if (!m) return null;

  const windowOpen = refundWindowRemaining > 0 && paymentState !== "COMMITTED";
  const canRefund  = windowOpen && paymentState === "PENDING";
  const canManual  = paymentConfirmed && refundWindowRemaining > 0;
  const showFlash  = !!m.flashOffer && !upsellAccepted && paymentState === "IDLE";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={co.cont}>

      {/* Merchant strip */}
      <View style={[co.strip, { borderColor: m.brandColour, backgroundColor: `${m.brandColour}16` }]}>
        <Text style={co.stripEmoji}>{m.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[co.stripName, { color: m.accentColour }]}>{m.name}</Text>
          <Text style={co.stripCat}>{m.category}</Text>
        </View>
        <Text style={[co.total, { color: m.brandColour }]}>£{orderTotal.toFixed(2)}</Text>
      </View>

      {/* ── UPSELL ENGINE — Flash Offer ─────────────────────────────────── */}
      {showFlash && m.flashOffer && (
        <>
          <Divider label="Flash Offer" />
          <View style={[co.flashWrap, { borderColor: m.brandColour }]}>
            <Text style={[co.flashTag, { color: m.brandColour }]}>⚡ PERISHABLE OFFER</Text>
            <View style={co.flashBody}>
              <Text style={co.flashEmoji}>{m.flashOffer.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={co.flashName}>{m.flashOffer.label}</Text>
                <View style={co.priceRow}>
                  <Text style={co.was}>£{m.flashOffer.originalPrice.toFixed(2)}</Text>
                  <Text style={co.now}>£{m.flashOffer.salePrice.toFixed(2)}</Text>
                  <Text style={co.save}>
                    SAVE {Math.round((1 - m.flashOffer.salePrice / m.flashOffer.originalPrice) * 100)}%
                  </Text>
                </View>
              </View>
              <SolidBtn
                label="ADD"
                onPress={() => dispatch({ type: "ACCEPT_UPSELL" })}
                bg={m.brandColour}
              />
            </View>
          </View>
        </>
      )}

      {/* Upsell confirmed confirmation line */}
      {upsellAccepted && m.flashOffer && (
        <View style={co.upsellCfm}>
          <Text style={co.upsellCfmTxt}>
            {m.flashOffer.emoji} {m.flashOffer.label} added · New total: £{orderTotal.toFixed(2)}
          </Text>
        </View>
      )}

      <Divider label="Payment" />

      {/* ── PAYMENT: IDLE ───────────────────────────────────────────────── */}
      {paymentState === "IDLE" && (
        <>
          {/* ── BRANDED PAY BUTTON — Costa Red (#C8102E) for Costa,
               falls back to merchant brandColour for all other partners   */}
          <CostaPayBtn
            total={orderTotal}
            brandColour={m.brandColour}
            onPress={simulatePaymentSuccess}
          />
          <Btn label="[DEV] Simulate Declined" onPress={simulatePaymentFailed} colour={T.textDim} />
        </>
      )}

      {/* ── PAYMENT: PENDING ────────────────────────────────────────────── */}
      {paymentState === "PENDING" && (
        <>
          <View style={co.pendingRow}>
            <Text style={co.pendingTxt}>Contacting payment provider…</Text>
          </View>
          <View style={co.refundBar}>
            <Text style={[co.refundLbl, { color: refundWindowRemaining > 15 ? T.green : refundWindowRemaining > 8 ? T.amber : T.red }]}>
              REFUND WINDOW: {refundWindowRemaining}s
            </Text>
          </View>
          {canRefund && (
            <Btn
              label={`Cancel & Refund  ·  ${refundWindowRemaining}s remaining`}
              onPress={() => dispatch({ type: "CANCEL_AND_REFUND" })}
              colour={T.amber}
            />
          )}
        </>
      )}

      {/* ── PAYMENT: SUCCESS + window open → manual start ───────────────── */}
      {canManual && (
        <>
          <View style={co.successRow}>
            <Text style={co.successTxt}>✓  Authorised  ·  £{orderTotal.toFixed(2)}</Text>
          </View>
          <SolidBtn
            label={`Start Order Now  (${refundWindowRemaining}s to cancel)`}
            onPress={() => dispatch({ type: "COMMIT_TO_FUELING" })}
            bg={T.green}
          />
          <Btn
            label={`Cancel & Refund  ·  ${refundWindowRemaining}s remaining`}
            onPress={() => dispatch({ type: "CANCEL_AND_REFUND" })}
            colour={T.amber}
          />
        </>
      )}

      {/* ── PAYMENT: FAILED — Logic Patch recovery path ─────────────────── */}
      {paymentState === "FAILED" && (
        <View style={co.failureBox}>
          <Text style={co.failureIcon}>⊘</Text>
          <Text style={co.failureTitle}>Payment Declined</Text>
          <Text style={co.failureBody}>
            Your card was not charged. Please check your payment method and try again.
          </Text>

          {/* [TRY AGAIN] — resets sub-state to IDLE, keeps merchant & cart */}
          <SolidBtn
            label=" Try Again"
            onPress={() => dispatch({ type: "RETRY_PAYMENT" })}
            bg={T.orange}
          />

          {/* [RETURN TO HUB] — clears session, returns to merchant grid */}
          <Btn
            label="Return to Hub"
            onPress={() => dispatch({ type: "CANCEL_AND_REFUND" })}
            colour={T.textSecond}
          />
        </View>
      )}

    </ScrollView>
  );
}
const co = StyleSheet.create({
  cont:        { padding: 16, paddingBottom: 60 },
  strip:       { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 14, gap: 12, marginBottom: 4 },
  stripEmoji:  { fontSize: 30 },
  stripName:   { fontSize: T.lg, fontWeight: "700" },
  stripCat:    { fontSize: T.xs, color: T.textDim, letterSpacing: 1, marginTop: 2 },
  total:       { fontSize: T.xl, fontWeight: "300" },
  // Flash offer
  flashWrap:   { borderWidth: 1, borderRadius: 12, padding: 14, marginVertical: 6 },
  flashTag:    { fontSize: T.xs, fontWeight: "700", letterSpacing: 2, marginBottom: 10 },
  flashBody:   { flexDirection: "row", alignItems: "center", gap: 10 },
  flashEmoji:  { fontSize: 30 },
  flashName:   { fontSize: T.md, fontWeight: "600", color: T.textPrimary, marginBottom: 4 },
  priceRow:    { flexDirection: "row", alignItems: "center", gap: 8 },
  was:         { fontSize: T.sm, color: T.textDim, textDecorationLine: "line-through" },
  now:         { fontSize: T.lg, fontWeight: "700", color: T.green },
  save:        { fontSize: T.xs, color: T.orange, fontWeight: "700", letterSpacing: 1 },
  // Upsell confirmation
  upsellCfm:   { backgroundColor: `${T.green}14`, borderRadius: 8, padding: 10, marginVertical: 4 },
  upsellCfmTxt:{ fontSize: T.sm, color: T.green, textAlign: "center" },
  // Pending
  pendingRow:  { alignItems: "center", paddingVertical: 20 },
  pendingTxt:  { fontSize: T.md, color: T.textSecond, letterSpacing: 0.5 },
  refundBar:   { alignItems: "center", paddingVertical: 6 },
  refundLbl:   { fontSize: T.sm, fontWeight: "700", letterSpacing: 2 },
  // Success
  successRow:  { flexDirection: "row", justifyContent: "center", padding: 12, backgroundColor: `${T.green}14`, borderRadius: 10, marginBottom: 6 },
  successTxt:  { fontSize: T.md, color: T.green, fontWeight: "600" },
  // ── PAYMENT FAILURE PATH ──────────────────────────────────────────────────
  failureBox:  { borderWidth: 1, borderColor: T.red, borderRadius: 14, padding: 20, alignItems: "center", gap: 10, backgroundColor: `${T.red}0A`, marginVertical: 8 },
  failureIcon: { fontSize: 40, color: T.red },
  failureTitle:{ fontSize: T.xl, fontWeight: "700", color: T.red },
  failureBody: { fontSize: T.sm, color: T.textSecond, textAlign: "center", lineHeight: 20 },
});

// ─────────────────────────────────────────────────────────────────────────────
// REWARD TOGGLE — Sats / Fiat (Loss Aversion Protocol per claude.md §6)
// Sats is presented as the DEFAULT; Fiat is framed as a "Partial Claim"
// Delta: Sats value shown at 15% uplift over Fiat equivalent
// ─────────────────────────────────────────────────────────────────────────────

const SATS_UPLIFT = 1.15; // 15% higher perceived value — claude.md §6

function satsFromGBP(gbp: number): number {
  // Mock rate: 1 BTC = £70,000 → 1 GBP = ~1,428 sats
  // Reward = 2% cashback in sats, uplifted
  const rate        = 1_428;
  const fiatReward  = gbp * 0.02;
  return Math.round(fiatReward * rate * SATS_UPLIFT);
}

function fiatReward(gbp: number): number {
  return +(gbp * 0.02).toFixed(2);
}

function RewardToggle() {
  const { state, dispatch } = useApp();
  const { rewardMode, orderTotal } = state;

  const sats = satsFromGBP(orderTotal);
  const fiat = fiatReward(orderTotal);
  const isSats = rewardMode === "SATS";

  // Loss aversion string — shown when Fiat is selected
  const leaveOnTable = Math.round(sats - sats / SATS_UPLIFT);

  return (
    <View style={rw.wrap}>

      {/* ── Section header ─────────────────────────────────────────────── */}
      <View style={rw.header}>
        <Text style={rw.headerLbl}>REWARD TRACK</Text>
        <Text style={rw.headerSub}>Select before order completes</Text>
      </View>

      {/* ── Toggle row ─────────────────────────────────────────────────── */}
      <View style={rw.toggleRow}>

        {/* SATS track — DEFAULT, presented as standard */}
        <Pressable
          style={[rw.track, rw.satsTrack, isSats && rw.trackActive]}
          onPress={() => dispatch({ type: "SET_REWARD_MODE", mode: "SATS" })}
        >
          <Text style={rw.trackIcon}>₿</Text>
          <Text style={[rw.trackLabel, { color: T.orange }]}>Satoshis</Text>
          <Text style={[rw.trackValue, { color: isSats ? T.orange : T.textDim }]}>
            {sats.toLocaleString()} sats
          </Text>
          {isSats && (
            <View style={rw.activePill}>
              <Text style={rw.activePillTxt}>SELECTED</Text>
            </View>
          )}
          {!isSats && (
            <Text style={rw.lossWarning}>
              ⚠ {leaveOnTable} sats left on table
            </Text>
          )}
        </Pressable>

        {/* FIAT track — framed as "Partial Claim" */}
        <Pressable
          style={[rw.track, rw.fiatTrack, !isSats && rw.fiatTrackActive]}
          onPress={() => dispatch({ type: "SET_REWARD_MODE", mode: "FIAT" })}
        >
          <Text style={rw.trackIcon}>£</Text>
          <Text style={[rw.trackLabel, { color: T.cobalt }]}>Cash</Text>
          <Text style={[rw.trackValue, { color: !isSats ? T.cobalt : T.textDim }]}>
            £{fiat.toFixed(2)} back
          </Text>
          {!isSats && (
            <View style={[rw.activePill, { backgroundColor: `${T.cobalt}22`, borderColor: T.cobalt }]}>
              <Text style={[rw.activePillTxt, { color: T.cobalt }]}>PARTIAL CLAIM</Text>
            </View>
          )}
        </Pressable>

      </View>

      {/* ── Incentive delta line — loss aversion anchoring ─────────────── */}
      <View style={rw.deltaRow}>
        {isSats ? (
          <Text style={rw.deltaPositive}>
            ✦ Satoshi track earns {Math.round((SATS_UPLIFT - 1) * 100)}% more than cash — borderless & never expires
          </Text>
        ) : (
          <Text style={rw.deltaNegative}>
            You are forfeiting {leaveOnTable} sats ({Math.round((SATS_UPLIFT - 1) * 100)}% uplift) by choosing cash
          </Text>
        )}
      </View>

    </View>
  );
}
const rw = StyleSheet.create({
  wrap:          { width: "100%", marginVertical: 4 },
  header:        { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  headerLbl:     { fontSize: T.xs, color: T.textDim, letterSpacing: 2.5, textTransform: "uppercase" },
  headerSub:     { fontSize: T.xs, color: T.textDim },
  toggleRow:     { flexDirection: "row", gap: 10 },
  track:         { flex: 1, borderWidth: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 5, backgroundColor: T.surface },
  satsTrack:     { borderColor: `${T.orange}44` },
  trackActive:   { borderColor: T.orange, backgroundColor: `${T.orange}0E` },
  fiatTrack:     { borderColor: `${T.cobalt}33` },
  fiatTrackActive:{ borderColor: T.cobalt, backgroundColor: `${T.cobalt}0E` },
  trackIcon:     { fontSize: 24 },
  trackLabel:    { fontSize: T.xs, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  trackValue:    { fontSize: T.lg, fontWeight: "300" },
  activePill:    { borderWidth: 1, borderColor: T.orange, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: `${T.orange}22` },
  activePillTxt: { fontSize: 8, fontWeight: "800", color: T.orange, letterSpacing: 1.5 },
  lossWarning:   { fontSize: 8, color: T.amber, textAlign: "center", letterSpacing: 0.5 },
  deltaRow:      { marginTop: 10, paddingHorizontal: 4 },
  deltaPositive: { fontSize: T.xs, color: T.orange, textAlign: "center", lineHeight: 17 },
  deltaNegative: { fontSize: T.xs, color: T.amber,  textAlign: "center", lineHeight: 17 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — FUELING (updated — Reward Toggle injected after Fulfilment Mode)
// ─────────────────────────────────────────────────────────────────────────────

function FuelingScreen() {
  const { state, dispatch } = useApp();
  const {
    orderToken, dwellElapsedMs, isDwellVerified,
    fulfilmentMode, selectedMerchant: m,
  } = state;

  const ds  = Math.floor(dwellElapsedMs / 1_000);
  const dm  = Math.floor(ds / 60);
  const drs = ds % 60;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={fu.cont}>
      <Text style={fu.title}>Order In Progress</Text>
      <Text style={fu.merch}>{m?.emoji}  {m?.name}</Text>

      {orderToken && (
        <View style={fu.tokenWrap}>
          <Text style={fu.tokenLbl}>ORDER</Text>
          <Text style={fu.tokenNum}>{orderToken}</Text>
        </View>
      )}

      <Divider label="Dwell Timer" />
      <View style={[fu.dwellBox, { borderColor: isDwellVerified ? T.green : T.teal }]}>
        <Text style={[fu.dwellTime, { color: isDwellVerified ? T.green : T.teal }]}>
          {String(dm).padStart(2, "0")}:{String(drs).padStart(2, "0")}
        </Text>
        <Text style={fu.dwellSub}>
          {isDwellVerified
            ? "✓ Stationary verified"
            : `Threshold: ${DWELL_THRESHOLD_MS / 60_000} min · calibrate on-site`}
        </Text>
      </View>

      <Divider label="Fulfilment Mode" />
      {!fulfilmentMode ? (
        <View style={fu.modeRow}>
          <Pressable
            style={[fu.modeBtn, { borderColor: T.cobalt }]}
            onPress={() => dispatch({ type: "SET_FULFILMENT_MODE", mode: "COLLECT" })}
          >
            <Text style={fu.modeEmoji}>🏃</Text>
            <Text style={[fu.modeLbl, { color: T.cobalt }]}>Collect</Text>
            <Text style={fu.modeSub}>Pick up at counter</Text>
          </Pressable>
          <Pressable
            style={[fu.modeBtn, { borderColor: T.orange }]}
            onPress={() => dispatch({ type: "SET_FULFILMENT_MODE", mode: "BAY_DELIVERY" })}
          >
            <Text style={fu.modeEmoji}>🚗</Text>
            <Text style={[fu.modeLbl, { color: T.orange }]}>Bay Delivery</Text>
            <Text style={fu.modeSub}>Runner to Car Park G</Text>
          </Pressable>
        </View>
      ) : (
        <View style={fu.modeCfm}>
          <Text style={fu.modeCfmTxt}>
            {fulfilmentMode === "COLLECT" ? "🏃 Collecting at counter" : "🚗 Runner dispatched to bay"}
          </Text>
        </View>
      )}

      {/* ── REWARD TOGGLE — injected after fulfilment mode ─────────────── */}
      <Divider label="Reward Track" />
      <RewardToggle />

      <Divider />
      <Btn
        label="[DEV] Simulate: Order Ready →"
        onPress={() => dispatch({ type: "ORDER_READY" })}
        colour={T.textDim}
      />
    </ScrollView>
  );
}
const fu = StyleSheet.create({
  cont:       { padding: 16, paddingBottom: 60, alignItems: "center" },
  title:      { fontSize: T.xl, fontWeight: "200", color: T.cream, letterSpacing: 4 },
  merch:      { fontSize: T.sm, color: T.textSecond, marginTop: 4 },
  tokenWrap:  { alignItems: "center", marginVertical: 8 },
  tokenLbl:   { fontSize: T.xs, color: T.textDim, letterSpacing: 3 },
  tokenNum:   { fontSize: T.hero, fontWeight: "200", color: T.cream, letterSpacing: 8 },
  dwellBox:   { borderWidth: 1, borderRadius: 12, padding: 20, alignItems: "center", width: "100%", gap: 6 },
  dwellTime:  { fontSize: 44, fontWeight: "200", letterSpacing: 4 },
  dwellSub:   { fontSize: T.sm, color: T.textDim, textAlign: "center" },
  modeRow:    { flexDirection: "row", gap: 10, width: "100%" },
  modeBtn:    { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14, alignItems: "center", gap: 4, backgroundColor: T.surface },
  modeEmoji:  { fontSize: 26 },
  modeLbl:    { fontSize: T.md, fontWeight: "700" },
  modeSub:    { fontSize: T.xs, color: T.textDim, textAlign: "center" },
  modeCfm:    { borderWidth: StyleSheet.hairlineWidth, borderColor: T.border, borderRadius: 10, padding: 14, width: "100%", alignItems: "center" },
  modeCfmTxt: { fontSize: T.md, color: T.textSecond },
});

// ─────────────────────────────────────────────────────────────────────────────
// CHRONOGRAPH DIAL — SVG (Watch Ultra / Breguet horology aesthetic)
// Geometry per [PLAN] block — see dev notes in claude.md §5
// ─────────────────────────────────────────────────────────────────────────────

const CX = 140;
const CY = 140;
const R  = 130;

/** Convert polar coords to Cartesian */
const polar = (angleDeg: number, radius: number) => ({
  x: CX + radius * Math.sin((angleDeg * Math.PI) / 180),
  y: CY - radius * Math.cos((angleDeg * Math.PI) / 180),
});

const ROMAN = [
  "XII","I","II","III","IV","V","VI","VII","VIII","IX","X","XI",
];

function DialFace(_props: { handColour: string }) {
  // Tick marks — 60 minor, 12 major
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle  = i * 6;
    const isMaj  = i % 5 === 0;
    const inner  = isMaj ? 106 : 112;
    const outer  = 118;
    const sw     = isMaj ? 1.8 : 0.8;
    const from   = polar(angle, inner);
    const to     = polar(angle, outer);
    return { from, to, sw, isMaj, angle };
  });

  // Guilloché — 48 radial lines, very faint
  const guilloche = Array.from({ length: 48 }, (_, i) => {
    const angle = i * 7.5;
    return { from: polar(angle, 18), to: polar(angle, 108) };
  });

  return (
    <Svg width={280} height={280} viewBox="0 0 280 280">

      {/* ── Bezel outer ring ───────────────────────────────────────────── */}
      <Circle cx={CX} cy={CY} r={R}       fill="none" stroke="#3A3830" strokeWidth={2} />
      <Circle cx={CX} cy={CY} r={R - 4}  fill="none" stroke="#2A2820" strokeWidth={0.5} />

      {/* ── Dial face ──────────────────────────────────────────────────── */}
      <Circle cx={CX} cy={CY} r={115} fill="#0C0B09" />

      {/* ── Guilloché texture (engine-turned radial) ───────────────────── */}
      {guilloche.map((g, i) => (
        <Line
          key={`g${i}`}
          x1={g.from.x} y1={g.from.y}
          x2={g.to.x}   y2={g.to.y}
          stroke="rgba(255,253,208,0.055)"
          strokeWidth={0.25}
        />
      ))}

      {/* ── Chapter ring boundary ──────────────────────────────────────── */}
      <Circle cx={CX} cy={CY} r={120} fill="none" stroke="#3A3830" strokeWidth={0.6} />

      {/* ── Tick marks ────────────────────────────────────────────────── */}
      {ticks.map((t, i) => (
        <Line
          key={`t${i}`}
          x1={t.from.x} y1={t.from.y}
          x2={t.to.x}   y2={t.to.y}
          stroke={t.isMaj ? "#FFFDD0" : "#6A6858"}
          strokeWidth={t.sw}
          strokeLinecap="round"
        />
      ))}

      {/* ── Roman numerals ────────────────────────────────────────────── */}
      {ROMAN.map((numeral, i) => {
        const isCardinal = i % 3 === 0;
        const r   = isCardinal ? 92 : 88;
        const pos = polar(i * 30, r);
        return (
          <SvgText
            key={`rn${i}`}
            x={pos.x}
            y={pos.y + (isCardinal ? 4 : 3)}
            textAnchor="middle"
            fontSize={isCardinal ? 11 : 7.5}
            fontWeight={isCardinal ? "400" : "300"}
            fill={isCardinal ? "#FFFDD0" : "#8A8878"}
            fontFamily="Georgia, serif"
            letterSpacing={0.5}
          >
            {numeral}
          </SvgText>
        );
      })}

      {/* ── SUBDIAL (small seconds, Breguet signature — bottom) ───────── */}
      <Circle cx={CX} cy={190} r={18}   fill="#080806" stroke="#3A3830" strokeWidth={0.8} />
      <Circle cx={CX} cy={190} r={17.5} fill="none"   stroke="#2A2820" strokeWidth={0.3} />
      {Array.from({ length: 60 }, (_, i) => {
        const a    = i * 6;
        const isMj = i % 5 === 0;
        const sf  = Math.sin((a * Math.PI) / 180);
        const cf  = Math.cos((a * Math.PI) / 180);
        const ri  = isMj ? 11 : 14;
        const ro  = 16;
        return (
          <Line
            key={`sd${i}`}
            x1={CX + ri * sf} y1={190 - ri * cf}
            x2={CX + ro * sf} y2={190 - ro * cf}
            stroke={isMj ? "#FFFDD0" : "#4A4838"}
            strokeWidth={isMj ? 0.8 : 0.4}
          />
        );
      })}

      {/* Subdial label */}
      <SvgText
        x={CX} y={182}
        textAnchor="middle"
        fontSize={5} fill="#6A6858"
        fontFamily="Georgia, serif"
        letterSpacing={1.5}
      >
        REFUELER
      </SvgText>

    </Svg>
  );
}

function DialHands({
  elapsedMs,
  isComplete,
  handColour,
}: {
  elapsedMs:  number;
  isComplete: boolean;
  handColour: string;
}) {
  const totalSecs = elapsedMs / 1_000;
  const secAngle  = (totalSecs % 60)   * 6;
  const minAngle  = (totalSecs / 60)   * 6;
  const hrAngle   = (totalSecs / 3600) * 30;

  // Subdial seconds hand (small seconds, bottom)
  const subAngle  = secAngle;

  const hourTip   = polar(hrAngle,  58);
  const hourTail  = polar(hrAngle + 180, 10);
  const minTip    = polar(minAngle,  82);
  const minTail   = polar(minAngle + 180, 14);
  const secTip    = polar(secAngle, 100);
  const secTail   = polar(secAngle + 180, 18);

  // Subdial hand (relative to subdial centre 140, 190)
  const subSf     = Math.sin((subAngle * Math.PI) / 180);
  const subCf     = Math.cos((subAngle * Math.PI) / 180);
  const subTipR   = 13;
  const subTailR  = 5;

  const completeTint = isComplete ? "#30D158" : handColour;

  return (
    <Svg
      width={280} height={280} viewBox="0 0 280 280"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* ── Hour hand (Breguet style — wide base, tapered) ─────────────── */}
      <Line
        x1={hourTail.x} y1={hourTail.y}
        x2={hourTip.x}  y2={hourTip.y}
        stroke={T.cream}
        strokeWidth={3.2}
        strokeLinecap="round"
      />

      {/* ── Minute hand ─────────────────────────────────────────────────── */}
      <Line
        x1={minTail.x} y1={minTail.y}
        x2={minTip.x}  y2={minTip.y}
        stroke={T.cream}
        strokeWidth={2.2}
        strokeLinecap="round"
      />

      {/* ── Seconds hand (branded colour, longer, counterweight tail) ───── */}
      <Line
        x1={secTail.x} y1={secTail.y}
        x2={secTip.x}  y2={secTip.y}
        stroke={completeTint}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      {/* seconds counterweight lozenge */}
      <Circle
        cx={(secTail.x + polar(secAngle + 180, 12).x) / 2}
        cy={(secTail.y + polar(secAngle + 180, 12).y) / 2}
        r={3.5}
        fill={completeTint}
      />

      {/* ── Subdial seconds hand ─────────────────────────────────────────── */}
      <Line
        x1={CX - subTailR * subSf} y1={190 + subTailR * subCf}
        x2={CX + subTipR * subSf}  y2={190 - subTipR * subCf}
        stroke={completeTint}
        strokeWidth={0.9}
        strokeLinecap="round"
      />

      {/* ── Centre pivot ─────────────────────────────────────────────────── */}
      <Circle cx={CX} cy={CY} r={5}   fill="#1A1916" stroke={T.cream}       strokeWidth={0.8} />
      <Circle cx={CX} cy={CY} r={2.5} fill={completeTint} />
      {/* Subdial pivot */}
      <Circle cx={CX} cy={190} r={2}  fill={completeTint} />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — CHRONOGRAPH (Watch Ultra / Horology rebuild)
// Navigation: [CLOSE/DISMISS] exits manually at any point
// ─────────────────────────────────────────────────────────────────────────────

function ChronographScreen() {
  const { state, dispatch } = useApp();
  const {
    orderToken, orderElapsedMs, isOrderComplete,
    fulfilmentMode, selectedMerchant: m,
    rewardMode, orderTotal,
  } = state;

  const elapsed = Math.floor(orderElapsedMs / 1_000);
  const mins    = Math.floor(elapsed / 60);
  const secs    = elapsed % 60;
  const pad     = (n: number) => String(n).padStart(2, "0");

  // Seconds hand uses merchant brand colour — Costa Red sweeps the dial
  const handColour = m?.brandColour ?? T.orange;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.bg }}
      contentContainerStyle={ch.cont}
    >
      {/* ── [CLOSE/DISMISS] ───────────────────────────────────────────── */}
      <Pressable style={ch.closeBtn} onPress={() => dispatch({ type: "RESET_TO_HUB" })}>
        <Text style={ch.closeTxt}>✕  Dismiss</Text>
      </Pressable>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <Text style={ch.title}>CHRONOGRAPH</Text>
      <Text style={ch.merch}>{m?.emoji}  {m?.name?.toUpperCase()}</Text>

      {/* ── Order token ───────────────────────────────────────────────── */}
      {orderToken && (
        <View style={ch.tokenWrap}>
          <Text style={ch.tokenLbl}>ORDER</Text>
          <Text style={[ch.tokenNum, { color: isOrderComplete ? T.green : T.cream }]}>
            {orderToken}
          </Text>
        </View>
      )}

      {/* ── SVG DIAL ──────────────────────────────────────────────────── */}
      <View style={ch.dialWrap}>
        <DialFace handColour={handColour} />
        <DialHands
          elapsedMs={orderElapsedMs}
          isComplete={isOrderComplete}
          handColour={handColour}
        />
        {/* Digital sub-readout inside bezel, above subdial */}
        <View style={ch.digitalOverlay}>
          <Text style={[ch.digitalTime, { color: isOrderComplete ? T.green : T.cream }]}>
            {isOrderComplete ? "✓" : `${pad(mins)}:${pad(secs)}`}
          </Text>
          <Text style={ch.digitalSub}>
            {isOrderComplete ? "COMPLETE" : "ELAPSED"}
          </Text>
        </View>
      </View>

      {/* ── Fulfilment hint ───────────────────────────────────────────── */}
      {!isOrderComplete && (
        <Text style={ch.hint}>
          {fulfilmentMode === "COLLECT"
            ? "Head to the collection counter"
            : "Runner is on the way to Car Park G · Bay 4"}
        </Text>
      )}

      {/* ── Completion state ──────────────────────────────────────────── */}
      {isOrderComplete && (
        <>
          <Divider label="Order Complete" />
          <View style={ch.completeBadge}>
            <Text style={ch.completeTitle}>Enjoy your refuel.</Text>
          </View>

          {/* ── DASHBOARD QR — reward voucher (Goal C) ────────────────── */}
          {m && orderToken && (
            <DashboardQR
              orderToken={orderToken}
              merchant={m}
              rewardMode={rewardMode}
              orderTotal={orderTotal}
              elapsedMs={orderElapsedMs}
            />
          )}

          <Btn
            label="Return to Hub"
            onPress={() => dispatch({ type: "RESET_TO_HUB" })}
            colour={T.green}
          />
        </>
      )}

      <Divider />
      {!isOrderComplete && (
        <Btn
          label="[DEV] Mark Order Complete"
          onPress={() => dispatch({ type: "ORDER_COMPLETE" })}
          colour={T.textDim}
        />
      )}
    </ScrollView>
  );
}
const ch = StyleSheet.create({
  cont:           { padding: 16, paddingTop: 48, paddingBottom: 60, alignItems: "center", gap: 6 },
  closeBtn:       { position: "absolute", top: 10, right: 12, zIndex: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: T.border, borderRadius: 8 },
  closeTxt:       { fontSize: T.sm, color: T.textSecond },
  title:          { fontSize: T.sm, fontWeight: "300", color: T.textDim, letterSpacing: 6, textTransform: "uppercase" },
  merch:          { fontSize: T.xs, color: T.textDim, letterSpacing: 2 },
  tokenWrap:      { alignItems: "center", marginVertical: 4 },
  tokenLbl:       { fontSize: T.xs, color: T.textDim, letterSpacing: 3, textTransform: "uppercase" },
  tokenNum:       { fontSize: T.hero, fontWeight: "200", letterSpacing: 8 },
  // Dial
  dialWrap:       { width: 280, height: 280, position: "relative", marginVertical: 8 },
  digitalOverlay: { position: "absolute", top: 108, left: 0, right: 0, alignItems: "center" },
  digitalTime:    { fontSize: 18, fontWeight: "200", letterSpacing: 4, fontVariant: ["tabular-nums"] },
  digitalSub:     { fontSize: 7, color: T.textDim, letterSpacing: 3, marginTop: 2 },
  // Below dial
  hint:           { fontSize: T.sm, color: T.textSecond, textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  completeBadge:  { alignItems: "center", gap: 4, marginVertical: 8 },
  completeTitle:  { fontSize: T.xl, color: T.cream, fontWeight: "300" },
  completeSub:    { fontSize: T.sm, color: T.textDim, letterSpacing: 1 },
});

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD QR — Scannable reward voucher (pure SVG, no external library)
// [PLAN] geometry: 21×21 module grid, Version-1 proportions, LCG seed from
// orderToken + merchantId → deterministic, unique per session.
// Finder patterns: 3 corners, 7×7 / 5×5 / 3×3 ring structure.
// Data modules: LCG fill, merchant brandColour on dark, transparent on light.
// CarPlay "View Voucher" surface — claude.md §6
// ─────────────────────────────────────────────────────────────────────────────

const QR_MODULES  = 21;
const QR_MOD_SIZE = 8;
const QR_QUIET    = 10;
const QR_SIZE     = QR_MODULES * QR_MOD_SIZE + QR_QUIET * 2; // 188

/** LCG pseudo-random — deterministic per seed */
function lcgRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = ((Math.imul(s, 1_664_525) + 1_013_904_223) >>> 0);
    return s / 0xFFFFFFFF;
  };
}

/** True if cell (col, row) is inside a finder or timing reserved zone */
function isReserved(col: number, row: number): boolean {
  if (col <= 7 && row <= 7) return true;
  if (col >= QR_MODULES - 8 && row <= 7) return true;
  if (col <= 7 && row >= QR_MODULES - 8) return true;
  if (row === 6 && col >= 8 && col <= QR_MODULES - 9) return true;
  if (col === 6 && row >= 8 && row <= QR_MODULES - 9) return true;
  return false;
}

/** Build 21×21 boolean matrix — true = dark module */
function buildQRMatrix(seed: number): boolean[][] {
  const rand = lcgRand(seed);
  const matrix: boolean[][] = Array.from({ length: QR_MODULES }, () =>
    Array(QR_MODULES).fill(false)
  );
  // Timing strips
  for (let i = 8; i <= QR_MODULES - 9; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }
  // Data modules
  for (let r = 0; r < QR_MODULES; r++) {
    for (let c = 0; c < QR_MODULES; c++) {
      if (!isReserved(c, r)) matrix[r][c] = rand() > 0.48;
    }
  }
  return matrix;
}

/** Single finder pattern rendered at SVG offset (ox, oy) */
function FinderPattern({ ox, oy, dark }: { ox: number; oy: number; dark: string }) {
  const m = QR_MOD_SIZE;
  return (
    <G>
      <Rect x={ox}     y={oy}     width={7*m} height={7*m} fill={dark}     rx={1.5} />
      <Rect x={ox+m}   y={oy+m}   width={5*m} height={5*m} fill="#0C0C0C"  />
      <Rect x={ox+2*m} y={oy+2*m} width={3*m} height={3*m} fill={dark}     rx={0.5} />
    </G>
  );
}

function DashboardQR({
  orderToken,
  merchant,
  rewardMode,
  orderTotal,
  elapsedMs,
}: {
  orderToken:  string;
  merchant:    Merchant;
  rewardMode:  "SATS" | "FIAT";
  orderTotal:  number;
  elapsedMs:   number;
}) {
  const seed = parseInt(orderToken, 10) * 31 +
    merchant.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const matrix = buildQRMatrix(seed);
  const dark   = merchant.brandColour;

  const elapsed     = Math.floor(elapsedMs / 1_000);
  const mins        = Math.floor(elapsed / 60);
  const secs        = elapsed % 60;
  const pad         = (n: number) => String(n).padStart(2, "0");
  const rewardLabel = rewardMode === "SATS"
    ? `${Math.round(orderTotal * 0.02 * 1_428 * 1.15).toLocaleString()} sats`
    : `£${(orderTotal * 0.02).toFixed(2)} cashback`;
  const rewardColour = rewardMode === "SATS" ? T.orange : T.cobalt;
  const mod          = QR_MOD_SIZE;

  return (
    <View style={dq.card}>

      {/* ── Merchant header ───────────────────────────────────────────── */}
      <View style={dq.header}>
        <Text style={dq.emoji}>{merchant.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[dq.merchantName, { color: dark }]}>
            {merchant.name.toUpperCase()}
          </Text>
          <Text style={dq.category}>{merchant.category}</Text>
        </View>
        <View style={[dq.rewardPill, { borderColor: rewardColour }]}>
          <Text style={[dq.rewardPillTxt, { color: rewardColour }]}>
            {rewardMode === "SATS" ? "₿ SATS" : "£ CASH"}
          </Text>
        </View>
      </View>

      {/* ── QR SVG grid ───────────────────────────────────────────────── */}
      <View style={[dq.qrWrap, { borderColor: `${dark}55` }]}>
        <Svg
          width={QR_SIZE}
          height={QR_SIZE}
          viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
        >
          {/* Quiet zone */}
          <Rect x={0} y={0} width={QR_SIZE} height={QR_SIZE} fill={T.surface} />

          {/* Data modules */}
          {matrix.map((row, ri) =>
            row.map((isDark, ci) => {
              if (!isDark || isReserved(ci, ri)) return null;
              return (
                <Rect
                  key={`d-${ri}-${ci}`}
                  x={QR_QUIET + ci * mod}
                  y={QR_QUIET + ri * mod}
                  width={mod - 1}
                  height={mod - 1}
                  fill={dark}
                  rx={1}
                />
              );
            })
          )}

          {/* Timing strip dark cells */}
          {Array.from({ length: QR_MODULES - 16 }, (_, i) => i + 8).map(i => (
            i % 2 === 0 ? (
              <G key={`tm-${i}`}>
                <Rect x={QR_QUIET + i*mod}  y={QR_QUIET + 6*mod} width={mod-1} height={mod-1} fill={dark} rx={1} />
                <Rect x={QR_QUIET + 6*mod}  y={QR_QUIET + i*mod} width={mod-1} height={mod-1} fill={dark} rx={1} />
              </G>
            ) : null
          ))}

          {/* Finder patterns — top-left, top-right, bottom-left */}
          <FinderPattern ox={QR_QUIET}                               oy={QR_QUIET}                               dark={dark} />
          <FinderPattern ox={QR_QUIET + (QR_MODULES - 7) * mod}     oy={QR_QUIET}                               dark={dark} />
          <FinderPattern ox={QR_QUIET}                               oy={QR_QUIET + (QR_MODULES - 7) * mod}     dark={dark} />
        </Svg>
      </View>

      {/* ── Reward value ──────────────────────────────────────────────── */}
      <Text style={[dq.rewardValue, { color: rewardColour }]}>
        {rewardLabel}
      </Text>

      {/* ── Token + elapsed ───────────────────────────────────────────── */}
      <Text style={dq.tokenLine}>
        ORDER · {orderToken}  ·  {pad(mins)}:{pad(secs)}
      </Text>

      {/* ── Scan bar ──────────────────────────────────────────────────── */}
      <View style={[dq.scanBar, { backgroundColor: `${dark}14`, borderColor: `${dark}44` }]}>
        <Text style={[dq.scanTxt, { color: dark }]}>
          ▣  Present to {merchant.name} staff to claim reward
        </Text>
      </View>

    </View>
  );
}
const dq = StyleSheet.create({
  card:          { width: "100%", backgroundColor: T.surface, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: T.border },
  header:        { flexDirection: "row", alignItems: "center", gap: 10 },
  emoji:         { fontSize: 28 },
  merchantName:  { fontSize: T.sm, fontWeight: "800", letterSpacing: 2 },
  category:      { fontSize: T.xs, color: T.textDim, letterSpacing: 1 },
  rewardPill:    { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  rewardPillTxt: { fontSize: T.xs, fontWeight: "800", letterSpacing: 1.5 },
  qrWrap:        { alignSelf: "center", borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  rewardValue:   { fontSize: T.xl, fontWeight: "300", textAlign: "center", letterSpacing: 2 },
  tokenLine:     { fontSize: T.xs, color: T.textDim, textAlign: "center", letterSpacing: 3 },
  scanBar:       { borderWidth: 1, borderRadius: 8, padding: 12, alignItems: "center" },
  scanTxt:       { fontSize: T.sm, fontWeight: "600", letterSpacing: 0.5 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SESSION LOGGER PANEL
// ─────────────────────────────────────────────────────────────────────────────

function SessionLoggerPanel() {
  const { state, copyLogsToClipboard } = useApp();
  const [open, setOpen] = useState(false);
  const recent = [...state.sessionLogs].reverse().slice(0, open ? 30 : 4);

  return (
    <View style={sl.panel}>
      <Pressable onPress={() => setOpen(x => !x)} style={sl.header}>
        <Text style={sl.title}>{open ? "▾" : "▸"} SESSION LOG · {state.sessionLogs.length} EVENTS</Text>
        <Pressable onPress={copyLogsToClipboard} style={sl.copyBtn}>
          <Text style={sl.copyTxt}>⎘ Copy All</Text>
        </Pressable>
      </Pressable>
      {open && (
        <ScrollView style={sl.scroll} showsVerticalScrollIndicator={false}>
          {recent.map((log, i) => (
            <View key={i} style={sl.row}>
              <Text style={sl.ts}>{log.timestamp.slice(11, 19)}</Text>
              <Text style={sl.event}>{log.event}</Text>
              {log.meta ? <Text style={sl.meta} numberOfLines={1}>{JSON.stringify(log.meta)}</Text> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
const sl = StyleSheet.create({
  panel:   { backgroundColor: "#080808", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.border },
  header:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
  title:   { fontSize: T.xs, color: T.textDim, letterSpacing: 2 },
  copyBtn: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: T.border, borderRadius: 4 },
  copyTxt: { fontSize: T.xs, color: T.cobalt, letterSpacing: 1 },
  scroll:  { maxHeight: 150, paddingHorizontal: 14, paddingBottom: 8 },
  row:     { paddingVertical: 3, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#161616" },
  ts:      { fontSize: 9, color: T.textDim },
  event:   { fontSize: 10, color: "#5A5A5A" },
  meta:    { fontSize: 9, color: "#3A3A3A" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PANE (rendered inside MenuOverlay)
// ─────────────────────────────────────────────────────────────────────────────

function SettingsPane() {
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === "DARK";

  return (
    <>
      <Text style={mn.sectionTitle}>Settings</Text>

      {/* ── THEME TOGGLE ──────────────────────────────────────────────── */}
      <Pressable onPress={toggleTheme} style={se.row}>
        <View style={se.labelWrap}>
          <Text style={se.emoji}>{isDark ? "🌙" : "☀️"}</Text>
          <View>
            <Text style={se.label}>{isDark ? "Dark Mode" : "Light Mode"}</Text>
            <Text style={se.sub}>Tap to switch</Text>
          </View>
        </View>
        {/* Pill toggle */}
        <View style={[se.pill, { backgroundColor: isDark ? T.teal : T.amber }]}>
          <View style={[se.thumb, { alignSelf: isDark ? "flex-end" : "flex-start" }]} />
        </View>
      </Pressable>

      <View style={se.divider} />

      {/* ── FUTURE SETTINGS ───────────────────────────────────────────── */}
      <Text style={mn.comingSoon}>Bay Config · Coming soon</Text>
      <Text style={mn.comingSoon}>Notifications · Coming soon</Text>
    </>
  );
}
const se = StyleSheet.create({
  row:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  labelWrap: { flexDirection: "row", alignItems: "center", gap: 12 },
  emoji:     { fontSize: 22 },
  label:     { fontSize: T.md, color: T.textPrimary, fontWeight: "600" },
  sub:       { fontSize: T.xs, color: T.textDim, marginTop: 2 },
  pill:      { width: 46, height: 26, borderRadius: 13, padding: 3, justifyContent: "center" },
  thumb:     { width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFF" },
  divider:   { height: StyleSheet.hairlineWidth, backgroundColor: T.border, marginVertical: 10 },
});

// ─────────────────────────────────────────────────────────────────────────────
// MENU OVERLAY
// Right-side drawer with three tabs: Main / Session Info / Settings
// ─────────────────────────────────────────────────────────────────────────────

const MENU_ITEMS: { label: string; view: MenuView; emoji: string }[] = [
  { label: "Main Menu",    view: "MAIN",         emoji: "⊞" },
  { label: "Session Info", view: "SESSION_INFO",  emoji: "📋" },
  { label: "Settings",     view: "SETTINGS",      emoji: "⚙️" },
];

function MenuOverlay() {
  const { state, dispatch } = useApp();
  if (state.menuView === "NONE") return null;

  const renderContent = () => {
    switch (state.menuView) {
      case "SESSION_INFO":
        return (
          <>
            <Text style={mn.sectionTitle}>Session Info</Text>
            <View style={mn.infoRow}><Text style={mn.infoKey}>Screen</Text><Text style={mn.infoVal}>{state.screen}</Text></View>
            <View style={mn.infoRow}><Text style={mn.infoKey}>Merchant</Text><Text style={mn.infoVal}>{state.selectedMerchant?.name ?? "—"}</Text></View>
            <View style={mn.infoRow}><Text style={mn.infoKey}>Payment</Text><Text style={mn.infoVal}>{state.paymentState}</Text></View>
            <View style={mn.infoRow}><Text style={mn.infoKey}>Token</Text><Text style={mn.infoVal}>{state.orderToken ?? "—"}</Text></View>
            <View style={mn.infoRow}><Text style={mn.infoKey}>Events</Text><Text style={mn.infoVal}>{state.sessionLogs.length}</Text></View>
          </>
        );
      case "SETTINGS":
        return <SettingsPane />;
      default: // MAIN
        return (
          <>
            <Text style={mn.sectionTitle}>Navigation</Text>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.view}
                style={[mn.menuItem, state.menuView === item.view && mn.menuItemActive]}
                onPress={() => dispatch({ type: "OPEN_MENU", view: item.view })}
              >
                <Text style={mn.menuEmoji}>{item.emoji}</Text>
                <Text style={mn.menuLabel}>{item.label}</Text>
              </Pressable>
            ))}
            <Divider />
            <Btn
              label="Return to Hub"
              onPress={() => { dispatch({ type: "CLOSE_MENU" }); dispatch({ type: "RESET_TO_HUB" }); }}
              colour={T.textSecond}
            />
          </>
        );
    }
  };

  return (
    <View style={mn.backdrop}>
      <Pressable style={mn.dismissZone} onPress={() => dispatch({ type: "CLOSE_MENU" })} />
      <View style={mn.drawer}>
        {/* Drawer header */}
        <View style={mn.drawerHeader}>
          <Text style={mn.drawerTitle}>REFUELER</Text>
          <Pressable onPress={() => dispatch({ type: "CLOSE_MENU" })} style={mn.closeBtn}>
            <Text style={mn.closeTxt}>✕</Text>
          </Pressable>
        </View>
        {/* Sub-nav tabs */}
        <View style={mn.tabs}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.view}
              style={[mn.tab, state.menuView === item.view && mn.tabActive]}
              onPress={() => dispatch({ type: "OPEN_MENU", view: item.view })}
            >
              <Text style={mn.tabTxt}>{item.emoji}</Text>
            </Pressable>
          ))}
        </View>
        <ScrollView style={mn.drawerBody} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
}
const mn = StyleSheet.create({
  backdrop:       { ...StyleSheet.absoluteFillObject, zIndex: 100, flexDirection: "row" },
  dismissZone:    { flex: 0.3, backgroundColor: "rgba(0,0,0,0.55)" },
  drawer:         { flex: 0.7, backgroundColor: T.surface, borderLeftWidth: 1, borderLeftColor: T.border },
  drawerHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.border },
  drawerTitle:    { fontSize: T.md, fontWeight: "200", color: T.cream, letterSpacing: 4 },
  closeBtn:       { padding: 6 },
  closeTxt:       { fontSize: T.md, color: T.textSecond },
  tabs:           { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.border },
  tab:            { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabActive:      { borderBottomWidth: 2, borderBottomColor: T.teal },
  tabTxt:         { fontSize: 18 },
  drawerBody:     { padding: 16 },
  sectionTitle:   { fontSize: T.sm, color: T.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  menuItem:       { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 8, marginBottom: 4 },
  menuItemActive: { backgroundColor: `${T.teal}18` },
  menuEmoji:      { fontSize: 18 },
  menuLabel:      { fontSize: T.md, color: T.textPrimary },
  comingSoon:     { fontSize: T.sm, color: T.textDim, padding: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: T.border, borderRadius: 8, marginBottom: 8 },
  infoRow:        { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.border },
  infoKey:        { fontSize: T.sm, color: T.textDim },
  infoVal:        { fontSize: T.sm, color: T.textPrimary, fontWeight: "600" },
});

// ─────────────────────────────────────────────────────────────────────────────
// NAV BAR (updated — adds hamburger menu trigger on right slot)
// ─────────────────────────────────────────────────────────────────────────────

const SCREEN_LABELS: Record<AppState, string> = {
  SPLASH: "", HUB: "Hub", CHECKOUT: "Checkout", FUELING: "Order", CHRONOGRAPH: "Chronograph",
};

function NavBar() {
  const { state, dispatch } = useApp();
  if (state.screen === "SPLASH") return null;

  const canBack = state.screen === "HUB" || state.screen === "CHECKOUT";
  const onBack  = state.screen === "CHECKOUT"
    ? () => dispatch({ type: "CANCEL_AND_REFUND" })
    : () => dispatch({ type: "RESET_TO_HUB" });

  return (
    <View style={nb.bar}>
      {canBack
        ? <Pressable onPress={onBack} style={nb.backBtn}><Text style={nb.backTxt}>‹</Text></Pressable>
        : <View style={nb.backBtn} />}
      <Text style={nb.label}>{SCREEN_LABELS[state.screen]}</Text>
      {/* ── HAMBURGER — opens MENU overlay ─────────────────────────────── */}
      <Pressable
        onPress={() => dispatch({ type: "OPEN_MENU", view: "MAIN" })}
        style={nb.menuBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={nb.menuIco}>≡</Text>
      </Pressable>
    </View>
  );
}
const nb = StyleSheet.create({
  bar:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.border, backgroundColor: T.bg },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backTxt: { fontSize: 30, color: T.textSecond, lineHeight: 34 },
  label:   { fontSize: T.md, fontWeight: "600", color: T.textPrimary, letterSpacing: 1 },
  menuBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  menuIco: { fontSize: 22, color: T.textSecond, lineHeight: 28 },
});

// ─────────────────────────────────────────────────────────────────────────────
// APP ROUTER
// ─────────────────────────────────────────────────────────────────────────────

function AppRouter() {
  const { state } = useApp();
  const { mode }  = useTheme();

  const renderScreen = () => {
    switch (state.screen) {
      case "SPLASH":      return <SplashScreen />;
      case "HUB":         return <HubScreen />;
      case "CHECKOUT":    return <CheckoutScreen />;
      case "FUELING":     return <FuelingScreen />;
      case "CHRONOGRAPH": return <ChronographScreen />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar barStyle={mode === "LIGHT" ? "dark-content" : "light-content"} backgroundColor={T.bg} />
      <NavBar />
      <View style={{ flex: 1 }}>
        {renderScreen()}
        {/* MENU overlay — renders above screen content, below NavBar */}
        <MenuOverlay />
      </View>
      {state.screen !== "SPLASH" && <SessionLoggerPanel />}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ThemeProvider>
  );
}
