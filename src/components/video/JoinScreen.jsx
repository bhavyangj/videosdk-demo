import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Users, ArrowRight, Loader2, Key } from "lucide-react";

interface JoinScreenProps {
  onJoinRoomA: (token: string) => void;
  onJoinRoomB: (token: string) => void;
  isLoading: boolean;
}

export const JoinScreen = ({ onJoinRoomA, onJoinRoomB, isLoading }: JoinScreenProps) => {
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(true);

  const handleJoinA = () => {
    if (!token.trim()) {
      setShowTokenInput(true);
      return;
    }
    onJoinRoomA(token);
  };

  const handleJoinB = () => {
    if (!token.trim()) {
      setShowTokenInput(true);
      return;
    }
    onJoinRoomB(token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo/Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-6 glow-primary">
            <Video className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            VideoSDK <span className="gradient-text">Room Switch</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Seamlessly switch between rooms with Media Relay support
          </p>
        </div>

        {/* Token Input */}
        <div className="glass-strong rounded-2xl p-6 mb-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Key className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">VideoSDK Token</h3>
              <p className="text-xs text-muted-foreground">Enter your API token to continue</p>
            </div>
          </div>
          <Input
            type="password"
            placeholder="Enter your VideoSDK token..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="bg-muted/50 border-border/50 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Get your token from{" "}
            <a 
              href="https://app.videosdk.live/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              videosdk.live
            </a>
          </p>
        </div>

        {/* Room Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {/* Room A */}
          <div className="glass-strong rounded-2xl p-6 group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Room A</h3>
                <p className="text-xs text-muted-foreground">Primary Room</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Join the primary conference room and start your session.
            </p>
            <Button
              onClick={handleJoinA}
              disabled={isLoading || !token.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Join Room A
            </Button>
          </div>

          {/* Room B */}
          <div className="glass-strong rounded-2xl p-6 group hover:border-accent/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Room B</h3>
                <p className="text-xs text-muted-foreground">Secondary Room</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Join the secondary room for breakout sessions.
            </p>
            <Button
              onClick={handleJoinB}
              disabled={isLoading || !token.trim()}
              variant="outline"
              className="w-full border-accent text-accent hover:bg-accent/10"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Join Room B
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 glass rounded-xl p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold gradient-text">Seamless</div>
              <div className="text-xs text-muted-foreground">Room Switching</div>
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">Media</div>
              <div className="text-xs text-muted-foreground">Relay Support</div>
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">No Reload</div>
              <div className="text-xs text-muted-foreground">Required</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
