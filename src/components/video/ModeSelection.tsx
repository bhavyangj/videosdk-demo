import { Button } from "@/components/ui/button";
import { Users, UserPlus, Video } from "lucide-react";

interface ModeSelectionProps {
    onSelectMode: (mode: "host" | "participant") => void;
}

export const ModeSelection = ({ onSelectMode }: ModeSelectionProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-6 glow-primary">
                        <Video className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-3">
                        VideoSDK <span className="gradient-text">Demo</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Choose your role to get started
                    </p>
                </div>

                {/* Mode Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
                    {/* Host Card */}
                    <div className="glass-strong rounded-2xl p-8 group hover:border-primary/50 transition-all duration-300 cursor-pointer"
                        onClick={() => onSelectMode("host")}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">Host</h3>
                                <p className="text-sm text-muted-foreground">Manage rooms & participants</p>
                            </div>
                        </div>
                        <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Create and manage multiple rooms
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Move participants between rooms
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Share room links with participants
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Full control over sessions
                            </li>
                        </ul>
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectMode("host");
                            }}
                        >
                            Start as Host
                        </Button>
                    </div>

                    {/* Participant Card */}
                    <div className="glass-strong rounded-2xl p-8 group hover:border-accent/50 transition-all duration-300 cursor-pointer"
                        onClick={() => onSelectMode("participant")}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                <UserPlus className="w-8 h-8 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">Participant</h3>
                                <p className="text-sm text-muted-foreground">Join a room</p>
                            </div>
                        </div>
                        <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                Join rooms via link or room ID
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                Enter your name before joining
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                Seamless room switching
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                Host can move you between rooms
                            </li>
                        </ul>
                        <Button
                            variant="outline"
                            className="w-full border-accent text-accent hover:bg-accent/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectMode("participant");
                            }}
                        >
                            Join as Participant
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

