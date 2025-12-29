import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

// Not in use for now
const RoomA = ({ meetingId, onParticipantJoined, isMediaRelayActive }) => {
  const [joined, setJoined] = useState(false);
  const [localParticipantId, setLocalParticipantId] = useState('');
  const mediaRelayConnectionRef = useRef(null);

  const { join, leave, participants, localParticipant } = useMeeting({
    onMeetingJoined: () => {
      setJoined(true);
      if (localParticipant?.id) {
        setLocalParticipantId(localParticipant.id);
        onParticipantJoined(localParticipant.id);
      }
    },
    onMeetingLeft: () => {
      setJoined(false);
      setLocalParticipantId('');
    },
  });

  useEffect(() => {
    if (localParticipant?.id && localParticipantId !== localParticipant.id) {
      setLocalParticipantId(localParticipant.id);
      onParticipantJoined(localParticipant.id);
    }
  }, [localParticipant, localParticipantId, onParticipantJoined]);

  // Media Relay Implementation
  useEffect(() => {
    if (isMediaRelayActive && localParticipant) {
      // Initialize media relay connection
      setupMediaRelay();
    } else if (mediaRelayConnectionRef.current) {
      // Clean up media relay connection
      mediaRelayConnectionRef.current.close();
      mediaRelayConnectionRef.current = null;
    }

    return () => {
      if (mediaRelayConnectionRef.current) {
        mediaRelayConnectionRef.current.close();
      }
    };
  }, [isMediaRelayActive, localParticipant]);

  const setupMediaRelay = async () => {
    // console.log('Setting up media relay from Room A');

    // Example structure for media relay:
    // 1. Get local media streams
    // 2. Forward media streams
  };

  const handleJoin = () => {
    if (meetingId) {
      join();
    }
  };

  const handleLeave = () => {
    leave();
    setJoined(false);
    setLocalParticipantId('');
  };

  const ParticipantView = ({ participantId }) => {
    const { micOn, webcamOn, displayName } = useParticipant(participantId);

    return (
      <div className="participant-card">
        <div className="participant-header">
          <span className="participant-name">{displayName || participantId}</span>
          <div className="participant-status">
            {micOn ? <FaMicrophone className="icon active" /> : <FaMicrophoneSlash className="icon muted" />}
            {webcamOn ? <FaVideo className="icon active" /> : <FaVideoSlash className="icon muted" />}
          </div>
        </div>
        <div className="participant-video">
          <span className="room-badge">Room A</span>
        </div>
      </div>
    );
  };

  const participantIds = useMemo(() => Array.from(participants.keys()), [participants]);

  return (
    <div className="room-container">
      <div className="room-header">
        <h2>Room A</h2>
        <div className="room-actions">
          {!joined ? (
            <button onClick={handleJoin} className="btn btn-primary">
              Join Room A
            </button>
          ) : (
            <button onClick={handleLeave} className="btn btn-danger">
              Leave Room A
            </button>
          )}
        </div>
      </div>

      <div className="meeting-info">
        <p><strong>Meeting ID:</strong> {meetingId}</p>
        <p><strong>Status:</strong> {joined ? 'Joined' : 'Not Joined'}</p>
        {localParticipantId && <p><strong>Your ID:</strong> {localParticipantId}</p>}
      </div>

      <div className="participants-grid">
        {joined && localParticipant && (
          <ParticipantView key={localParticipant.id} participantId={localParticipant.id} />
        )}

        {participantIds.map((participantId) => (
          participantId !== localParticipant?.id && (
            <ParticipantView key={participantId} participantId={participantId} />
          )
        ))}
      </div>

      {isMediaRelayActive && (
        <div className="media-relay-indicator">
          <div className="relay-pulse"></div>
          <span>Media Relay Active - Streaming to Room B</span>
        </div>
      )}
    </div>
  );
};

export default RoomA;