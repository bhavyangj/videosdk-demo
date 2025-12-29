import { useState, useCallback, useEffect, useRef } from "react";
import { MeetingProvider, useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Users,
    ArrowRight,
    Trash2,
    LogOut,
    Share2,
    Video,
} from "lucide-react";
import { toast } from "sonner";
import { createMeeting } from "@/lib/videoSdkApi";
import { ParticipantView } from "./ParticipantView";
import { MeetingControls } from "./MeetingControls";
import { v4 as uuid } from "uuid";

interface Room {
    id: string;
    name: string;
    meetingId: string;
    createdAt: Date;
}

interface HostViewProps {
    token: string;
    hostName: string;
    onLeave: () => void;
}

const RoomManager = ({
    rooms,
    currentRoomId,
    onSelectRoom,
    onCreateRoom,
    onDeleteRoom,
    onJoinRoom,
}: {
    rooms: Room[];
    currentRoomId: string | null;
    onSelectRoom: (roomId: string) => void;
    onCreateRoom: (name: string) => Promise<Room>;
    onDeleteRoom: (roomId: string) => void;
    onJoinRoom?: (roomId: string) => void;
}) => {
    const [newRoomName, setNewRoomName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) {
            toast.error("Please enter a room name");
            return;
        }
        setIsCreating(true);
        try {
            await onCreateRoom(newRoomName.trim());
            setNewRoomName("");
            toast.success("Room created successfully!");
        } catch (error) {
            toast.error("Failed to create room");
        } finally {
            setIsCreating(false);
        }
    };

    const copyRoomLink = (meetingId: string, roomName: string) => {
        const link = `${window.location.origin}?room=${meetingId}`;
        navigator.clipboard.writeText(link);
        toast.success(`Room link for "${roomName}" copied!`);
    };

    return (
        <Card className="glass-strong">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Rooms
                </CardTitle>
                <CardDescription>Create and manage rooms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Create Room */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter room name..."
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                        disabled={isCreating}
                    />
                    <Button
                        onClick={handleCreateRoom}
                        disabled={isCreating || !newRoomName.trim()}
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {/* Room List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {rooms.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No rooms created yet
                        </p>
                    ) : (
                        rooms.map((room) => (
                            <div
                                key={room.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${currentRoomId === room.id
                                    ? "bg-primary/10 border-primary"
                                    : "bg-muted/50 border-border hover:bg-muted"
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm truncate">{room.name}</p>
                                        {currentRoomId === room.id && (
                                            <Badge variant="default" className="text-xs">Active</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono truncate">
                                        {room.meetingId}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyRoomLink(room.meetingId, room.name)}
                                        className="h-8 w-8 p-0"
                                        title="Copy room link"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (onJoinRoom) {
                                                onJoinRoom(room.id);
                                            } else {
                                                onSelectRoom(room.id);
                                            }
                                        }}
                                        disabled={currentRoomId === room.id}
                                        className="h-8 w-8 p-0"
                                        title="Join room"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Button>
                                    {rooms.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDeleteRoom(room.id)}
                                            disabled={currentRoomId === room.id}
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            title="Delete room"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

interface Participant {
    displayName?: string;
    local?: boolean;
    id: string;
}

const ParticipantManager = ({
    participants,
    rooms,
    currentRoomId,
    onMoveParticipant,
}: {
    participants: Map<string, Participant>;
    rooms: Room[];
    currentRoomId: string | null;
    onMoveParticipant: (participantId: string, targetRoomId: string) => void;
    token: string;
}) => {
    const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

    const participantList = Array.from(participants.entries());

    const handleMove = (participantId: string, targetRoomId: string) => {
        if (targetRoomId === currentRoomId) {
            toast.error("Participant is already in this room");
            return;
        }
        onMoveParticipant(participantId, targetRoomId);
        setSelectedParticipant(null);
    };

    return (
        <Card className="glass-strong">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participants ({participantList.length})
                </CardTitle>
                <CardDescription>Manage participants across rooms</CardDescription>
            </CardHeader>
            <CardContent>
                {participantList.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No participants in current room
                    </p>
                ) : (
                    <div className="space-y-2">
                        {participantList.map(([participantId, participant]) => (
                            <div
                                key={participantId}
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                        {participant.displayName || "Anonymous"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {participant.local ? "You (Host)" : "Participant"}
                                    </p>
                                </div>
                                {!participant.local && (
                                    <div className="flex items-center gap-2">
                                        {selectedParticipant === participantId ? (
                                            <div className="flex items-center gap-1">
                                                {rooms
                                                    .filter((r) => r.id !== currentRoomId)
                                                    .map((room) => (
                                                        <Button
                                                            key={room.id}
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleMove(participantId, room.id)}
                                                            className="h-7 text-xs"
                                                        >
                                                            Move to {room.name}
                                                        </Button>
                                                    ))}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedParticipant(null)}
                                                    className="h-7"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedParticipant(participantId)}
                                                className="h-7 text-xs"
                                            >
                                                Move
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const HostMeetingView = ({
    meetingId,
    hostName,
    rooms,
    currentRoomId,
    onSelectRoom,
    onCreateRoom,
    onDeleteRoom,
    onMoveParticipant,
    onLeave,
    token
}: {
    meetingId: string;
    hostName: string;
    rooms: Room[];
    currentRoomId: string | null;
    onSelectRoom: (roomId: string) => void;
    onCreateRoom: (name: string) => Promise<Room>;
    onDeleteRoom: (roomId: string) => void;
    onMoveParticipant: (participantId: string, targetRoomId: string) => void;
    onLeave: () => void;
    token: string;
}) => {
    const { join, leave, participants, meetingId: activeMeetingId } = useMeeting({
        onMeetingJoined: () => {
            toast.success("Joined room as host");
        },
        onParticipantJoined: (participant) => {
            toast.info(`${participant.displayName} joined the room`);
        },
        onParticipantLeft: (participant) => {
            toast.info(`${participant.displayName} left the room`);
        },
        onError: (error) => {
            console.error("Meeting error:", error);
            toast.error("Meeting error occurred");
        },
    });

    useEffect(() => {
        join();
        return () => leave();
    }, []);

    // Use pubSub hook to publish room list
    const { publish } = usePubSub("ROOM_LIST");

    // Broadcast room list to participants whenever rooms change
    useEffect(() => {
        if (rooms.length > 0 && publish) {
            try {
                const roomData = {
                    rooms: rooms.map(room => ({
                        id: room.id,
                        name: room.name,
                        meetingId: room.meetingId,
                    })),
                };
                publish(JSON.stringify(roomData), { persist: true });
                // console.log("Broadcasted room list to participants:", rooms);
            } catch (error) {
                console.error("Error broadcasting room list:", error);
            }
        }
    }, [publish, rooms]);

    const handleLeave = async () => {
        leave();
        onLeave();
    };

    const handleJoinRoom = async (targetRoomId: string) => {
        if (targetRoomId === currentRoomId) {
            toast.info("You are already in this room");
            return;
        }

        const targetRoom = rooms.find((r) => r.id === targetRoomId);
        if (!targetRoom) {
            toast.error("Target room not found");
            return;
        }

        try {
            console.log('=== Starting Room Switch ===');
            console.log('Current room ID:', currentRoomId);
            console.log('Target room ID:', targetRoomId);
            console.log('Current meetingId:', meetingId);
            console.log('Target meetingId:', targetRoom.meetingId);

            toast.info(`Switching to ${targetRoom.name}...`);
            leave();

            // Update the room state - this will update MeetingProvider's meetingId
            // The key prop on MeetingProvider will force it to re-initialize with the new meetingId
            // This will automatically join the new room
            onSelectRoom(targetRoomId);

            console.log('Room state updated, MeetingProvider will re-initialize with new meetingId');

        } catch (error) {
            console.error("Error switching room:", error);
            toast.error("Failed to switch room");
        }
    };

    const participantIds = [...participants.keys()];
    const participantCount = participantIds.length;

    return (
        <div className="h-screen flex flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="room-badge room-badge-a">
                        <span className="status-indicator status-connected" />
                        Host - {rooms.find((r) => r.id === currentRoomId)?.name || "Room"}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {participantCount} {participantCount === 1 ? "Participant" : "Participants"}
                        </span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={handleLeave}
                    className="flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Leave
                </Button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                {/* Left Sidebar - Room & Participant Management */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto">
                    <RoomManager
                        rooms={rooms}
                        currentRoomId={currentRoomId}
                        onSelectRoom={onSelectRoom}
                        onCreateRoom={onCreateRoom}
                        onDeleteRoom={onDeleteRoom}
                        onJoinRoom={handleJoinRoom}
                        token={token}
                    />
                    <ParticipantManager
                        participants={participants}
                        rooms={rooms}
                        currentRoomId={currentRoomId}
                        onMoveParticipant={onMoveParticipant}
                        token={token}
                    />
                </div>

                {/* Main Video Area */}
                <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
                    <div className="flex-1 min-h-0">
                        {participantIds.length === 0 ? (
                            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
                                <div className="text-center">
                                    <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Waiting for participants...</p>
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
                        currentRoom={rooms.find((r) => r.id === currentRoomId)?.name || "Room"}
                        targetRoomId={null}
                        token={token}
                        onSwitchRoom={() => { }}
                        onMediaRelay={() => { }}
                        isRelaying={false}
                        onLeaveMeeting={onLeave}
                        availableRooms={rooms.map(r => ({ id: r.id, name: r.name, meetingId: r.meetingId }))}
                        currentMeetingId={meetingId}
                    />
                </div>
            </div>
        </div>
    );
};

export const HostView = ({ token, hostName, onLeave }: HostViewProps) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    const createNewRoom = useCallback(async (name: string) => {
        setIsCreatingRoom(true);
        try {
            const meetingId = await createMeeting({ token });
            const newRoom: Room = {
                id: uuid(),
                name,
                meetingId,
                createdAt: new Date(),
            };
            setRooms((prev) => {
                const updated = [...prev, newRoom];
                // Auto-join the first room
                if (prev.length === 0) {
                    setCurrentRoomId(newRoom.id);
                }
                return updated;
            });

            return newRoom;
        } catch (error) {
            console.error("Failed to create room:", error);
            toast.error("Failed to create room. Please check your token.");
            throw error;
        } finally {
            setIsCreatingRoom(false);
        }
    }, [token]);

    const deleteRoom = useCallback((roomId: string) => {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
        if (currentRoomId === roomId) {
            const remainingRooms = rooms.filter((r) => r.id !== roomId);
            setCurrentRoomId(remainingRooms.length > 0 ? remainingRooms[0].id : null);
        }
    }, [currentRoomId, rooms]);

    const selectRoom = useCallback((roomId: string) => {
        // This will be called after switchTo completes
        setCurrentRoomId(roomId);
    }, []);

    const moveParticipant = useCallback(async (participantId: string, targetRoomId: string) => {
        const targetRoom = rooms.find((r) => r.id === targetRoomId);
        if (!targetRoom) {
            toast.error("Target room not found");
            return;
        }

        // TODO : This would need to be implemented using VideoSDK's participant management 
        toast.info(`Ask participant to move to ${targetRoom.name}`);
    }, [rooms]);

    const currentRoom = rooms.find((r) => r.id === currentRoomId);

    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;
        // Create Room A and Room B by default
        const initializeRooms = async () => {
            try {
                await createNewRoom("Room A");
                // Small delay to ensure first room is created
                setTimeout(async () => {
                    await createNewRoom("Room B");
                }, 500);
            } catch (error) {
                console.error("Failed to initialize rooms:", error);
            }
        };
        initializeRooms();
    }, [createNewRoom]);


    if (!currentRoom) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Creating your first room...</p>
                </div>
            </div>
        );
    }

    return (
        <MeetingProvider
            key={currentRoom.meetingId} // Force re-initialization when room changes
            config={{
                meetingId: currentRoom.meetingId,
                micEnabled: false,
                webcamEnabled: false,
                name: hostName,
                debugMode: true,
            }}
            token={token}
        >
            <HostMeetingView
                meetingId={currentRoom.meetingId}
                hostName={hostName}
                rooms={rooms}
                currentRoomId={currentRoomId}
                onSelectRoom={selectRoom}
                onCreateRoom={createNewRoom}
                onDeleteRoom={deleteRoom}
                onMoveParticipant={moveParticipant}
                onLeave={onLeave}
                token={token}
            />
        </MeetingProvider>
    );
};

