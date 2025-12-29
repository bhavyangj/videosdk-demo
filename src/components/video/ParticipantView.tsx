import { useEffect, useMemo, useRef } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { Mic, MicOff, Video, VideoOff, User } from "lucide-react";

interface ParticipantViewProps {
    participantId: string;
    isLocal?: boolean;
}

export const ParticipantView = ({ participantId, isLocal = false }: ParticipantViewProps) => {
    const micRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const {
        webcamStream,
        micStream,
        webcamOn,
        micOn,
        isLocal: isLocalParticipant,
        displayName,
    } = useParticipant(participantId);

    const videoStream = useMemo(() => {
        if (webcamOn && webcamStream) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(webcamStream.track);
            return mediaStream;
        }
        return null;
    }, [webcamStream, webcamOn]);

    const audioStream = useMemo(() => {
        if (micOn && micStream) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(micStream.track);
            return mediaStream;
        }
        return null;
    }, [micStream, micOn]);

    useEffect(() => {
        if (videoRef.current && videoStream) {
            videoRef.current.srcObject = videoStream;
            videoRef.current.play().catch(console.error);
        }
    }, [videoStream]);

    useEffect(() => {
        if (micRef.current && audioStream && !isLocalParticipant) {
            micRef.current.srcObject = audioStream;
            micRef.current.play().catch(console.error);
        }
    }, [audioStream, isLocalParticipant]);

    return (
        <div className="video-container animate-scale-in">
            {webcamOn && videoStream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocalParticipant}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground text-sm">{displayName || "Participant"}</span>
                    </div>
                </div>
            )}

            <audio ref={micRef} autoPlay muted={isLocalParticipant} />

            <div className="video-overlay" />

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                        {displayName || "Participant"}
                        {isLocal && " (You)"}
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${micOn ? "bg-secondary" : "bg-destructive/80"
                        }`}>
                        {micOn ? (
                            <Mic className="w-3.5 h-3.5 text-foreground" />
                        ) : (
                            <MicOff className="w-3.5 h-3.5 text-destructive-foreground" />
                        )}
                    </div>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${webcamOn ? "bg-secondary" : "bg-destructive/80"
                        }`}>
                        {webcamOn ? (
                            <Video className="w-3.5 h-3.5 text-foreground" />
                        ) : (
                            <VideoOff className="w-3.5 h-3.5 text-destructive-foreground" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

