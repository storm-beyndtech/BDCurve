import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Lock } from "lucide-react";

export default function LiveTradePage() {
  return (
    <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl">
      {/* GIF Background */}
      <img
        src="/livetrade.gif"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />

      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Centered modal card */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="w-full max-w-sm mx-4 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl p-8 text-center space-y-6 shadow-2xl">
          <div className="flex items-center justify-center">
            <div className="p-4 rounded-full bg-white/10">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="mb-5 space-y-2">
            <h2 className="text-xl font-semibold text-white">Live Trade</h2>
            <p className="text-sm text-white/70">
              Live trading is not available for this account. Please contact support to enable this feature.
            </p>
          </div>

          <Link to="/contact">
            <Button className="w-full gap-2" variant="primary">
              <MessageCircle className="h-4 w-4" />
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
