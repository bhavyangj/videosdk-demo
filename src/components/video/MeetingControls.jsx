import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { useState, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Radio,
  Monitor,
  MonitorOff,
  Settings,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

const EMOJI_OPTIONS = ["👍", "👎", "❤️", "🎉", "🔥", "👏", "😂", "😮", "😢", "🤔"];

export const MeetingControls = ({
  currentRoom,
  targetRoomId,
  token,
  onSwitchRoom,
  onMediaRelay,
  isRelaying,
  onLeaveMeeting,
  availableRooms = [],
  currentMeetingId,
  participantName,
}) => {
  const { 
    leave, 
    toggleMic, 
    toggleWebcam, 
    localMicOn, 
    localWebcamOn, 
    switchTo,
    meeting,
    toggleScreenShare,
    localScreenShareOn,
    changeMic,
    changeWebcam,
  } = useMeeting();

  const { publish } = usePubSub("EMOJI_REACTION");

  // Device management state
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedMicDeviceId, setSelectedMicDeviceId] = useState("");
  const [selectedCameraDeviceId, setSelectedCameraDeviceId] = useState("");
  const [isDevicePopoverOpen, setIsDevicePopoverOpen] = useState(false);

  // Determine if this is a participant (has availableRooms and participantName)
  // Keep the select visible for participants even when rooms array is empty during transitions
  const isParticipant = !!participantName;

  // Enumerate devices on mount and when permissions are granted
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        // Request permissions first to get device labels
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        } catch (err) {
          console.log("Permission request failed or denied:", err);
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioInputs = devices
          .filter(device => device.kind === "audioinput")
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${audioDevices.length + 1}`,
            kind: device.kind,
          }));
        
        const videoInputs = devices
          .filter(device => device.kind === "videoinput")
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${videoDevices.length + 1}`,
            kind: device.kind,
          }));

        setAudioDevices(audioInputs);
        setVideoDevices(videoInputs);

        // Set default devices if available
        if (audioInputs.length > 0 && !selectedMicDeviceId) {
          setSelectedMicDeviceId(audioInputs[0].deviceId);
        }
        if (videoInputs.length > 0 && !selectedCameraDeviceId) {
          setSelectedCameraDeviceId(videoInputs[0].deviceId);
        }
      } catch (error) {
        console.error("Error enumerating devices:", error);
        toast.error("Failed to access device list");
      }
    };

    enumerateDevices();
  }, []);

  const handleToggleMic = () => {
    toggleMic();
    toast.success(localMicOn ? "Microphone muted" : "Microphone unmuted");
  };

  const handleToggleWebcam = () => {
    toggleWebcam();
    toast.success(localWebcamOn ? "Camera turned off" : "Camera turned on");
  };

  const handleToggleScreenShare = () => {
    if (toggleScreenShare) {
      toggleScreenShare();
      const isSharing = localScreenShareOn !== undefined ? localScreenShareOn : false;
      toast.success(isSharing ? "Screen sharing stopped" : "Screen sharing started");
    } else {
      toast.warning("Screen sharing is not available in this version");
    }
  };

  const handleChangeMic = async (deviceId) => {
    if (!changeMic) {
      toast.warning("Device switching is not available in this version");
      return;
    }
    try {
      setSelectedMicDeviceId(deviceId);
      await changeMic(deviceId);
      const device = audioDevices.find(d => d.deviceId === deviceId);
      toast.success(`Switched to ${device?.label || "microphone"}`);
      setIsDevicePopoverOpen(false);
    } catch (error) {
      console.error("Error changing microphone:", error);
      toast.error("Failed to change microphone");
    }
  };

  const handleChangeCamera = async (deviceId) => {
    if (!changeWebcam) {
      toast.warning("Device switching is not available in this version");
      return;
    }
    try {
      setSelectedCameraDeviceId(deviceId);
      await changeWebcam(deviceId);
      const device = videoDevices.find(d => d.deviceId === deviceId);
      toast.success(`Switched to ${device?.label || "camera"}`);
      setIsDevicePopoverOpen(false);
    } catch (error) {
      console.error("Error changing camera:", error);
      toast.error("Failed to change camera");
    }
  };

  const handleEmojiReaction = (emoji) => {
    try {
      publish(emoji, { persist: false });
      toast.info(`Sent reaction: ${emoji}`);
    } catch (error) {
      console.error("Error sending emoji reaction:", error);
      toast.error("Failed to send reaction");
    }
  };

  const handleLeave = () => {
    leave();
    toast.info("Left the meeting");
    onLeaveMeeting();
  };

  const handleSwitchRoom = (targetMeetingId) => {
    const roomToSwitch = targetMeetingId || targetRoomId;

    if (!roomToSwitch) {
      toast.error("Target room not available");
      return;
    }

    // Don't switch if already in the target room
    if (currentMeetingId && roomToSwitch === currentMeetingId) {
      toast.info("You are already in this room");
      return;
    }

    // Call the parent's onSwitchRoom callback
    // For participants, this will handle the room switch
    // For hosts, this uses the existing switchTo logic
    if (isParticipant) {
      onSwitchRoom(roomToSwitch);
    } else {
      // Host switching logic
      try {
        const targetRoom = availableRooms.find(r => r.meetingId === roomToSwitch);
        const roomName = targetRoom?.name || roomToSwitch;

        console.log(`Switching to room: ${roomName} (${roomToSwitch})`);
        toast.info(`Switching to ${roomName}...`);

        // Use VideoSDK's switchTo method for seamless room switching
        switchTo({
          meetingId: roomToSwitch,
          token: token,
        });
      } catch (error) {
        console.error("Error switching room:", error);
        toast.error("Failed to switch room");
      }
    }
  };

  // Get current room name for display
  const currentRoomName = availableRooms.find(r => r.meetingId === currentMeetingId)?.name || "Current Room";

  return (
    <div className="glass-strong rounded-2xl p-4 animate-slide-up">
      <div className="flex items-center justify-center gap-3 flex-wrap">

        {/* Room Switching - Always show for participants, show for host if rooms available */}
        {(availableRooms.length > 0) && (
          <div className="flex items-center gap-2">
            <Select
              value={currentMeetingId || ""}
              onValueChange={(value) => handleSwitchRoom(value)}
              disabled={availableRooms.length === 0}
            >
              <SelectTrigger className="w-[180px] sm:w-[220px] bg-primary hover:bg-primary/90 text-primary-foreground border-primary">
                <SelectValue placeholder="Select a room">
                  {availableRooms.length > 0 
                    ? currentRoomName 
                    : isParticipant 
                      ? "Loading rooms..." 
                      : "No rooms"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableRooms.length > 0 ? (
                  availableRooms.map((room) => (
                    <SelectItem
                      key={room.id}
                      value={room.meetingId}
                      disabled={room.meetingId === currentMeetingId}
                    >
                      <div className="flex items-center gap-2">
                        <span>{room.name}</span>
                        {room.meetingId === currentMeetingId && (
                          <span className="text-xs text-muted-foreground">{"(Current)"}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No rooms available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Media Relay Button - Show when multiple rooms available */}
        {isParticipant && availableRooms.length > 1 && (
          <>
            <Button
              onClick={onMediaRelay}
              variant={isRelaying ? "default" : "outline"}
              className={`flex items-center gap-2 ${isRelaying
                ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                : "border-accent text-accent hover:bg-accent/10"
                }`}
              title="Toggle Media Relay"
            >
              <Radio className={`w-4 h-4 ${isRelaying ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">{isRelaying ? "Stop Relay" : "Media Relay"}</span>
            </Button>
          </>
        )}

        {/* Separator */}
        <div className="w-px h-8 bg-border mx-1" />

        {/* Mic Toggle */}
        <button
          onClick={handleToggleMic}
          className={`control-button ${localMicOn ? "control-button-default" : "control-button-danger"}`}
          title={localMicOn ? "Mute microphone" : "Unmute microphone"}
        >
          {localMicOn ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={handleToggleWebcam}
          className={`control-button ${localWebcamOn ? "control-button-default" : "control-button-danger"}`}
          title={localWebcamOn ? "Turn off camera" : "Turn on camera"}
        >
          {localWebcamOn ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </button>

        {/* Device Selection Popover */}
        <Popover open={isDevicePopoverOpen} onOpenChange={setIsDevicePopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="control-button control-button-default"
              title="Device settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Microphone</label>
                <Select
                  value={selectedMicDeviceId}
                  onValueChange={handleChangeMic}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Camera</label>
                <Select
                  value={selectedCameraDeviceId}
                  onValueChange={handleChangeCamera}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Screen Share Toggle */}
        {toggleScreenShare && (
          <button
            onClick={handleToggleScreenShare}
            className={`control-button ${localScreenShareOn ? "control-button-default" : "control-button-default"}`}
            title={localScreenShareOn ? "Stop screen sharing" : "Start screen sharing"}
          >
            {localScreenShareOn ? (
              <MonitorOff className="w-5 h-5" />
            ) : (
              <Monitor className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Emoji Reactions Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="control-button control-button-default"
              title="Send emoji reaction"
            >
              <Smile className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiReaction(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-1"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Separator */}
        <div className="w-px h-8 bg-border mx-1" />

        {/* Leave Button */}
        <button
          onClick={handleLeave}
          className="control-button control-button-danger"
          title="Leave meeting"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
