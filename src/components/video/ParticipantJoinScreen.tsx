import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, User, ArrowRight, Loader2, Key } from "lucide-react";
import { toast } from "sonner";

interface ParticipantJoinScreenProps {
    onJoin: (name: string, roomId: string, token: string) => void;
    isLoading: boolean;
    initialRoomId?: string;
}

export const ParticipantJoinScreen = ({
    onJoin,
    isLoading,
    initialRoomId,
}: ParticipantJoinScreenProps) => {
    const [name, setName] = useState("");
    const [roomId, setRoomId] = useState(initialRoomId || "");
    const [token, setToken] = useState("");
    const [showTokenInput, setShowTokenInput] = useState(true);

    const handleJoin = () => {
        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }
        if (!roomId.trim()) {
            toast.error("Please enter a room ID or use the shared link");
            return;
        }
        if (!token.trim()) {
            toast.error("Please enter your VideoSDK token");
            return;
        }
        onJoin(name.trim(), roomId.trim(), token.trim());
    };

    // Extract room ID from URL if present
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get("room");
        if (roomParam && !roomId) {
            setRoomId(roomParam);
        }
    }, [roomId]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
                        <User className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Join as <span className="gradient-text">Participant</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Enter your details to join a room
                    </p>
                </div>

                <Card className="glass-strong">
                    <CardHeader>
                        <CardTitle>Join Room</CardTitle>
                        <CardDescription>Enter your name and room information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Your Name
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

                        {/* Room ID Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                Room ID or Link
                            </label>
                            <Input
                                placeholder="Enter room ID or paste room link..."
                                value={roomId}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Extract room ID from URL if pasted
                                    if (value.includes("room=")) {
                                        const urlParams = new URLSearchParams(value.split("?")[1]);
                                        setRoomId(urlParams.get("room") || value);
                                    } else {
                                        setRoomId(value);
                                    }
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                                disabled={isLoading}
                                className="bg-muted/50 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Get the room ID or link from the host
                            </p>
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
                            disabled={isLoading || !name.trim() || !roomId.trim() || !token.trim()}
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Join Room
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

