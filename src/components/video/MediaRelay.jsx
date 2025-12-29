import { useEffect, useRef } from "react";
import { MeetingProvider, useMeeting } from "@videosdk.live/react-sdk";
import { toast } from "sonner";

/**
 * MediaRelay component that relays media from source room to target room
 * This creates a background meeting instance that joins the target room
 * and attempts to relay media using VideoSDK's capabilities
 */
const MediaRelayInner = ({
    sourceMeetingId,
    targetMeetingId,
    isActive,
}) => {
    const hasJoinedRef = useRef(false);
    const { join, leave, meeting } = useMeeting({
        onMeetingJoined: () => {
            console.log(`[MediaRelay] Joined target room ${targetMeetingId} for media relay`);
            hasJoinedRef.current = true;

            // Review requestMediaRelay API
            if (meeting && typeof meeting.requestMediaRelay === "function") {
                try {
                    meeting.requestMediaRelay(
                        sourceMeetingId,
                        ["video", "audio"]
                    );
                    console.log(`[MediaRelay] Requested media relay from ${sourceMeetingId} to ${targetMeetingId}`);
                    toast.success("Media relay started");
                } catch (error) {
                    console.warn("[MediaRelay] requestMediaRelay not available or failed:", error);
                    toast.warning("Media relay API not available. Some features may be limited.");
                }
            } else {
                console.warn("[MediaRelay] requestMediaRelay method not available on meeting object");
                // Review VideoSDK's ILS (Interactive Live Streaming) mode
                // Implement a media relay solution
            }
        },
        onMeetingLeft: () => {
            console.log(`[MediaRelay] Left target room ${targetMeetingId}`);
            hasJoinedRef.current = false;
            toast.info("Media relay stopped");
        },
        onError: (error) => {
            console.error("[MediaRelay] Error:", error);
            toast.error("Media relay error occurred");
        },
    });

    useEffect(() => {
        if (isActive && !hasJoinedRef.current) {
            // Join the target room when relay is activated
            const timer = setTimeout(() => {
                join();
            }, 100);
            return () => {
                clearTimeout(timer);
            };
        } else if (!isActive && hasJoinedRef.current) {
            // Leave the target room when relay is deactivated
            leave();
            hasJoinedRef.current = false;
        }
    }, [isActive, join, leave]);

    // This component doesn't render anything visible
    // It operates in the background to relay media
    return null;
};

export const MediaRelay = ({
    sourceMeetingId,
    targetMeetingId,
    token,
    participantName,
    isActive,
}) => {
    if (!isActive || !targetMeetingId || !sourceMeetingId) {
        return null;
    }

    return (
        <MeetingProvider
            key={`relay-${targetMeetingId}`} // Force re-initialization when target changes
            config={{
                meetingId: targetMeetingId,
                micEnabled: false,
                webcamEnabled: false,
                name: `${participantName} (Relay)`,
                debugMode: true,
            }}
            token={token}
        >
            <MediaRelayInner
                sourceMeetingId={sourceMeetingId}
                targetMeetingId={targetMeetingId}
                isActive={isActive}
            />
        </MeetingProvider>
    );
};
