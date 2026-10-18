import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Copy, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface VirtualCardProps {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  type: "gold" | "platinum" | "merchant" | "giftcard";
  status: "active" | "frozen" | "pending";
  onFreeze?: () => void;
  onUnfreeze?: () => void;
}

export function VirtualCard({
  cardNumber,
  cardholderName,
  expiryDate,
  cvv,
  type,
  status,
  onFreeze,
  onUnfreeze,
}: VirtualCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);

  const formatCardNumber = (number: string, show: boolean) => {
    if (show) {
      return number.match(/.{1,4}/g)?.join(" ") || number;
    }
    const lastFour = number.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const gradientClass =
    type === "platinum"
      ? "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900"
      : type === "merchant"
      ? "bg-gradient-to-br from-blue-500 via-cyan-600 to-slate-900"
      : type === "giftcard"
      ? "bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700"
      : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900";

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card Container with 3D perspective */}
      <motion.div
        className="relative w-full aspect-[1.586/1] cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped(!isFlipped)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Card Front/Back */}
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          {/* FRONT SIDE */}
          <div
            className={`absolute inset-0 rounded-2xl shadow-2xl p-6 flex flex-col justify-between ${gradientClass} border border-white/10`}
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-white/60 font-medium tracking-wide">VIRTUAL CARD</p>
                <Badge variant={status === "active" ? "success" : status === "frozen" ? "outline" : "warning"}>
                  {status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Chip */}
            <div className="mt-4">
              <div className="w-12 h-10 rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg opacity-90"/>
            </div>

            {/* Card Number */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-white font-mono text-xl tracking-wider">
                  {formatCardNumber(cardNumber, showCardNumber)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCardNumber(!showCardNumber);
                  }}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {showCardNumber ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>

            {/* Cardholder & Expiry */}
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-xs text-white/50 uppercase tracking-wide">Cardholder</p>
                <p className="text-white font-medium tracking-wide uppercase">{cardholderName}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs text-white/50 uppercase tracking-wide">Expires</p>
                <p className="text-white font-medium tracking-wide">{expiryDate}</p>
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className={`absolute inset-0 rounded-2xl shadow-2xl ${gradientClass} border border-white/10`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Magnetic Stripe */}
            <div className="w-full h-12 bg-black mt-6"/>

            {/* CVV Section */}
            <div className="px-6 mt-8 space-y-4">
              <div className="bg-white/90 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600 font-medium">CVV</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCVV(!showCVV);
                    }}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {showCVV ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
                <p className="text-slate-900 font-mono text-2xl font-bold tracking-wider">
                  {showCVV ? cvv : "***"}
                </p>
              </div>

              <div className="text-white/60 text-xs space-y-1">
                <p>Keep this CVV secure</p>
                <p>Click card to flip back</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Card Actions */}
      <div className="mt-6 flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-2"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(cardNumber, "Card number");
          }}
        >
          <Copy className="h-4 w-4"/>
          Copy Number
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-2"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(cvv, "CVV");
          }}
        >
          <Copy className="h-4 w-4"/>
          Copy CVV
        </Button>

        {status === "active" ? (
          <Button
            size="sm"
            variant="destructive"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onFreeze?.();
            }}
          >
            <Lock className="h-4 w-4"/>
            Freeze
          </Button>
        ) : status === "frozen" ? (
          <Button
            size="sm"
            variant="primary"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onUnfreeze?.();
            }}
          >
            <Unlock className="h-4 w-4"/>
            Unfreeze
          </Button>
        ) : null}
      </div>

      {/* Helpful Hint */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        Click card to view CVV on the back
      </p>
    </div>
  );
}


