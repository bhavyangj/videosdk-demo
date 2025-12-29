import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowRight, Loader2, Key, User } from "lucide-react";
import { toast } from "sonner";

interface HostJoinScreenProps {
    onJoin: (name: string, token: string) => void;
    isLoading: boolean;
}

export const HostJoinScreen = ({ onJoin, isLoading }: HostJoinScreenProps) => {
    const [name, setName] = useState("");
    const [token, setToken] = useState("");
    const [showTokenInput, setShowTokenInput] = useState(true);

    const handleJoin = () => {
        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }
        if (!token.trim()) {
            toast.error("Please enter your VideoSDK token");
            return;
        }
        onJoin(name.trim(), token.trim());
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Host <span className="gradient-text">Setup</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Enter your details to start managing rooms
                    </p>
                </div>

                <Card className="glass-strong">
                    <CardHeader>
                        <CardTitle>Host Information</CardTitle>
                        <CardDescription>Enter your name and VideoSDK token</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Your Name (Host)
                            </label>
                            <Input
                                placeholder="Enter your name..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                                disabled={isLoading}
                                className="bg-muted/50"
                            />
                        </div>

                        {/* Token Input */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Key className="w-4 h-4" />
                                    VideoSDK Token
                                </label>
                                <button
                                    onClick={() => setShowTokenInput(!showTokenInput)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {showTokenInput ? "Hide" : "Show"}
                                </button>
                            </div>
                            {showTokenInput && (
                                <Input
                                    type="password"
                                    placeholder="Enter your VideoSDK token..."
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                                    disabled={isLoading}
                                    className="bg-muted/50 font-mono text-sm"
                                />
                            )}
                            <p className="text-xs text-muted-foreground">
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

                        {/* Join Button */}
                        <Button
                            onClick={handleJoin}
                            disabled={isLoading || !name.trim() || !token.trim()}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Start as Host
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

