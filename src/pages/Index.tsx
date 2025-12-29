import { useState, useCallback, useEffect } from "react";
import { ModeSelection } from "@/components/video/ModeSelection";
import { HostJoinScreen } from "@/components/video/HostJoinScreen";
import { HostView } from "@/components/video/HostView";
import { ParticipantJoinScreen } from "@/components/video/ParticipantJoinScreen";
import { ParticipantMeetingView } from "@/components/video/ParticipantMeetingView";
import { Helmet } from "react-helmet-async";

type Mode = "selection" | "host" | "participant";
type HostState = "join" | "active";
type ParticipantState = "join" | "active";

const Index = () => {
  const [mode, setMode] = useState<Mode>("selection");
  const [hostState, setHostState] = useState<HostState>("join");
  const [participantState, setParticipantState] = useState<ParticipantState>("join");

  // Host state
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string | null>(null);

  // Participant state
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [participantRoomId, setParticipantRoomId] = useState<string | null>(null);

  // Extract room ID from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room");
    if (roomParam) {
      setParticipantRoomId(roomParam);
      // Auto-select participant mode if room link is provided
      if (mode === "selection") {
        setMode("participant");
      }
    }
  }, [mode]);

  const handleModeSelection = useCallback((selectedMode: "host" | "participant") => {
    setMode(selectedMode);
    if (selectedMode === "host") {
      setHostState("join");
    } else {
      setParticipantState("join");
    }
  }, []);

  const handleHostJoin = useCallback((name: string, token: string) => {
    setHostName(name);
    setHostToken(token);
    setHostState("active");
  }, []);

  const handleHostLeave = useCallback(() => {
    setHostToken(null);
    setHostName(null);
    setHostState("join");
    setMode("selection");
  }, []);

  const handleParticipantJoin = useCallback((name: string, roomId: string, token: string) => {
    setParticipantName(name);
    setParticipantRoomId(roomId);
    setParticipantToken(token);
    setParticipantState("active");
  }, []);

  const handleParticipantLeave = useCallback(() => {
    setParticipantToken(null);
    setParticipantName(null);
    setParticipantRoomId(null);
    setParticipantState("join");
    setMode("selection");
  }, []);

  const handleParticipantRoomSwitch = useCallback((newMeetingId: string) => {
    setParticipantRoomId(newMeetingId);
  }, []);

  return (
    <>
      <Helmet>
        <title>VideoSDK Room Manager | Host & Participant Management</title>
        <meta name="description" content="VideoSDK room management system for hosts to create rooms and manage participants, with seamless participant joining experience." />
      </Helmet>

      <main className="min-h-screen">
        {mode === "selection" && (
          <ModeSelection onSelectMode={handleModeSelection} />
        )}

        {mode === "host" && (
          <>
            {hostState === "join" && (
              <HostJoinScreen
                onJoin={handleHostJoin}
                isLoading={false}
              />
            )}
            {hostState === "active" && hostToken && hostName && (
              <HostView
                token={hostToken}
                hostName={hostName}
                onLeave={handleHostLeave}
              />
            )}
          </>
        )}

        {mode === "participant" && (
          <>
            {participantState === "join" && (
              <ParticipantJoinScreen
                onJoin={handleParticipantJoin}
                isLoading={false}
                initialRoomId={participantRoomId || undefined}
              />
            )}
            {participantState === "active" &&
              participantToken &&
              participantName &&
              participantRoomId && (
                <ParticipantMeetingView
                  meetingId={participantRoomId}
                  participantName={participantName}
                  token={participantToken}
                  onLeave={handleParticipantLeave}
                  onRoomSwitch={handleParticipantRoomSwitch}
                />
              )}
          </>
        )}
      </main>
    </>
  );
};

export default Index;
