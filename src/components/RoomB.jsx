import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

// Not in use for now
const RoomB = ({ meetingId, onParticipantJoined, isMediaRelayActive }) => {
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

  // Media Relay Receiver Implementation
  useEffect(() => {
    if (isMediaRelayActive) {
      // Setup media relay receiver from Room A
      setupMediaRelayReceiver();
    }

    return () => {
      if (mediaRelayConnectionRef.current) {
        mediaRelayConnectionRef.current.close();
      }
    };
  }, [isMediaRelayActive]);

  const setupMediaRelayReceiver = async () => {
    // console.log('Setting up media relay receiver in Room B');
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
          <span className="room-badge">Room B</span>
        </div>
      </div>
    );
  };

  const participantIds = useMemo(() => Array.from(participants.keys()), [participants]);

  return (
    <div className="room-container">
      <div className="room-header">
        <h2>Room B</h2>
        <div className="room-actions">
          {!joined ? (
            <button onClick={handleJoin} className="btn btn-primary">
              Join Room B
            </button>
          ) : (
            <button onClick={handleLeave} className="btn btn-danger">
              Leave Room B
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
        <div className="media-relay-indicator receiver">
          <div className="relay-pulse"></div>
          <span>Receiving Media Relay from Room A</span>
        </div>
      )}
    </div>
  );
};

export default RoomB;