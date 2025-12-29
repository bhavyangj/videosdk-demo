import { useMeeting } from "@videosdk.live/react-sdk";
import { useEffect, useState } from "react";
import { ParticipantView } from "./ParticipantView";
import { MeetingControls } from "./MeetingControls";
import { Users, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface MeetingViewProps {
  meetingId: string;
  currentRoom: string;
  targetRoomId: string | null;
  token: string;
  onMeetingLeave: () => void;
  onSwitchComplete: () => void;
  isRelaying: boolean;
  onToggleRelay: () => void;
}

export const MeetingView = ({
  meetingId,
  currentRoom,
  targetRoomId,
  token,
  onMeetingLeave,
  onSwitchComplete,
  isRelaying,
  onToggleRelay,
}: MeetingViewProps) => {
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState<string | null>(meetingId);

  const { join, participants, meetingId: activeMeetingId } = useMeeting({
    onMeetingJoined: () => {
      setJoined(activeMeetingId || meetingId);
      toast.success(`Joined Room ${currentRoom}`);
    },
    onMeetingLeft: () => {
      console.log("Meeting Left");
      setJoined(null);
      onMeetingLeave();
    },
    onParticipantJoined: (participant) => {
      console.log("Participant Joined:", participant.displayName);
      toast.info(`${participant.displayName} joined the room`);
    },
    onParticipantLeft: (participant) => {
      console.log("Participant Left:", participant.displayName);
      toast.info(`${participant.displayName} left the room`);
    },
    onError: (error) => {
      console.error("Meeting Error:", error);
      toast.error("Meeting error occurred");
    },
  });

  // Monitor meetingId changes to detect room switches
  useEffect(() => {
    if (activeMeetingId && activeMeetingId !== meetingId) {
      console.log("Meeting ID changed (room switch detected):", activeMeetingId);
      setJoined(activeMeetingId);
      onSwitchComplete();
      toast.success(`Switched to Room ${meetingId}`);
    }
  }, [activeMeetingId, meetingId, currentRoom, onSwitchComplete]);

  useEffect(() => {
    // Join meeting when component mounts or meetingId changes
    if (meetingId) {
      console.log("Joining meeting:", meetingId);
      const timer = setTimeout(() => {
        join();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [meetingId]);

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    toast.success("Meeting ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const participantIds = [...participants.keys()];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`room-badge ${currentRoom === "A" ? "room-badge-a" : "room-badge-b"}`}>
            <span className={`status-indicator ${joined ? "status-connected" : "status-disconnected"}`} />
            Room {currentRoom}
          </div>

          {isRelaying && (
            <div className="room-badge bg-accent/20 text-accent border border-accent/30">
              <span className="status-indicator status-relay" />
              Relaying Media
            </div>
          )}
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
        </div>
      </div>

      {/* Participants Grid */}
      <div className="flex-1 min-h-0">
        {participantIds.length === 0 ? (
          <div className="h-full flex items-center justify-center">
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
                isLocal={participantId === [...participants.keys()][0]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <MeetingControls
        currentRoom={currentRoom}
        targetRoomId={targetRoomId}
        token={token}
        onSwitchRoom={onSwitchComplete}
        onMediaRelay={onToggleRelay}
        isRelaying={isRelaying}
      />
    </div>
  );
};
