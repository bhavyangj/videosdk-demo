import { useState, useEffect, useRef } from "react";
import { MeetingProvider, useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { ParticipantView } from "./ParticipantView";
import { MeetingControls } from "./MeetingControls";
import { MediaRelay } from "./MediaRelay";
import { Button } from "@/components/ui/button";
import { Users, Copy, Check, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Room {
    id: string;
    name: string;
    meetingId: string;
}

interface ParticipantMeetingViewProps {
    meetingId: string;
    participantName: string;
    token: string;
    onLeave: () => void;
    onRoomSwitch?: (newMeetingId: string) => void;
}

const ParticipantMeetingInner = ({
    meetingId,
    participantName,
    onLeave,
    token,
    onRoomSwitch,
}: ParticipantMeetingViewProps) => {
    const [copied, setCopied] = useState(false);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [isMediaRelayActive, setIsMediaRelayActive] = useState(false);
    const [targetRoomForRelay, setTargetRoomForRelay] = useState<string | null>(null);
    const isSwitchingRoomRef = useRef(false);
    const { join, leave, participants, switchTo } = useMeeting({
        onMeetingJoined: () => {
            toast.success("Joined room successfully!");
            isSwitchingRoomRef.current = false;
        },
        onMeetingLeft: () => {
            // Only call onLeave if we're not switching rooms
            // Room switching will trigger onMeetingLeft, but we don't want to leave entirely
            if (!isSwitchingRoomRef.current) {
                // This means we're actually leaving, not switching
                onLeave();
            }
            // Reset the flag after handling
            isSwitchingRoomRef.current = false;
        },
        onParticipantJoined: (participant) => {
            toast.info(`${participant.displayName} joined the room`);
        },
        onParticipantLeft: (participant) => {
            toast.info(`${participant.displayName} left the room`);
        },
        onError: (error) => {
            console.error("Meeting Error:", error);
            toast.error("Meeting error occurred");
        },
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            join();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Subscribe to room list updates from host using usePubSub hook
    const { messages } = usePubSub("ROOM_LIST");

    useEffect(() => {
        if (messages && messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            try {
                const messageData = typeof latestMessage.message === 'string' 
                    ? JSON.parse(latestMessage.message) 
                    : latestMessage.message;
                
                if (messageData.rooms && Array.isArray(messageData.rooms)) {
                    setAvailableRooms(messageData.rooms);
                }
            } catch (error) {
                console.error("Error parsing room list:", error);
            }
        }
        // Don't clear availableRooms if messages are empty - keep previous state
        // This ensures the room select stays visible during room transitions
    }, [messages]);

    const copyMeetingId = () => {
        navigator.clipboard.writeText(meetingId);
        setCopied(true);
        toast.success("Meeting ID copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeave = () => {
        leave();
        onLeave();
    };

    const participantIds = [...participants.keys()];

    return (
        <div className="h-screen flex flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="room-badge room-badge-b">
                        <span className="status-indicator status-connected" />
                        Participant - {participantName}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{participantIds.length} participant(s)</span>
                    </div>

                    <button
                        onClick={copyMeetingId}
                        className="glass px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-secondary/50 transition-colors"
                    >
                        <span className="text-xs font-mono text-muted-foreground">
                            {meetingId.slice(0, 4)}...{meetingId.slice(-4)}
                        </span>
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                        ) : (
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                    </button>

                    <Button variant="outline" onClick={handleLeave} className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Leave
                    </Button>
                </div>
            </div>

            {/* Participants Grid */}
            <div className="flex-1 min-h-0">
                {participantIds.length === 0 ? (
                    <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">Joining meeting...</p>
                        </div>
                    </div>
                ) : (
                    <div className={`grid gap-4 h-full ${participantIds.length === 1
                            ? "grid-cols-1"
                            : participantIds.length === 2
                                ? "grid-cols-1 md:grid-cols-2"
                                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        }`}>
                        {participantIds.map((participantId) => (
                            <ParticipantView
                                key={participantId}
                                participantId={participantId}
                                isLocal={participants.get(participantId)?.local}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <MeetingControls
                currentRoom={meetingId}
                targetRoomId={targetRoomForRelay}
                token={token}
                onSwitchRoom={async (targetMeetingId) => {
                    if (!targetMeetingId) return;
                    
                    // Don't switch if already in the target room
                    if (targetMeetingId === meetingId) {
                        toast.info("You are already in this room");
                        return;
                    }

                    try {
                        const targetRoom = availableRooms.find(r => r.meetingId === targetMeetingId);
                        const roomName = targetRoom?.name || targetMeetingId;
                        
                        // Stop media relay if active
                        if (isMediaRelayActive) {
                            setIsMediaRelayActive(false);
                            setTargetRoomForRelay(null);
                        }
                        
                        // Set flag to indicate we're switching rooms
                        isSwitchingRoomRef.current = true;
                        
                        toast.info(`Leaving current room and joining ${roomName}...`);
                        
                        // First, leave the current room
                        await leave();
                        
                        // Small delay to ensure leave completes
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        // Notify parent component to update meetingId
                        // This will cause MeetingProvider to re-initialize with new meetingId
                        if (onRoomSwitch) {
                            onRoomSwitch(targetMeetingId);
                        }
                    } catch (error) {
                        console.error("Error switching room:", error);
                        toast.error("Failed to switch room");
                        isSwitchingRoomRef.current = false;
                    }
                }}
                onMediaRelay={() => {
                    // Toggle media relay
                    if (isMediaRelayActive) {
                        setIsMediaRelayActive(false);
                        setTargetRoomForRelay(null);
                        toast.info("Media relay stopped");
                    } else {
                        // Find the other room (not the current one)
                        const otherRoom = availableRooms.find(r => r.meetingId !== meetingId);
                        if (otherRoom) {
                            setTargetRoomForRelay(otherRoom.meetingId);
                            setIsMediaRelayActive(true);
                            toast.info(`Starting media relay to ${otherRoom.name}...`);
                        } else {
                            toast.error("No other room available for media relay");
                        }
                    }
                }}
                onLeaveMeeting={handleLeave}
                isRelaying={isMediaRelayActive}
                availableRooms={availableRooms}
                currentMeetingId={meetingId}
                participantName={participantName}
            />

            {/* Media Relay Component */}
            {isMediaRelayActive && targetRoomForRelay && (
                <MediaRelay
                    sourceMeetingId={meetingId}
                    targetMeetingId={targetRoomForRelay}
                    token={token}
                    participantName={participantName}
                    isActive={isMediaRelayActive}
                />
            )}
        </div>
    );
};

export const ParticipantMeetingView = ({
    meetingId,
    participantName,
    token,
    onLeave,
    onRoomSwitch,
}: ParticipantMeetingViewProps) => {
    return (
        <MeetingProvider
            key={meetingId} // Force re-initialization when meetingId changes
            config={{
                meetingId: meetingId,
                micEnabled: false,
                webcamEnabled: false,
                name: participantName,
                debugMode: true,
            }}
            token={token}
        >
            <ParticipantMeetingInner
                meetingId={meetingId}
                participantName={participantName}
                token={token}
                onLeave={onLeave}
                onRoomSwitch={onRoomSwitch}
            />
        </MeetingProvider>
    );
};

