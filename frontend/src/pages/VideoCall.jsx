import { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { BASE_URL } from '../services/api';

// Free Google STUN Servers to find Public IP addresses
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

const VideoCall = () => {
    const { roomId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Refs for Video Elements and Connections
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const socketRef = useRef(null);
    const localStreamRef = useRef(null);

    // UI States
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [remoteUserConnected, setRemoteUserConnected] = useState(false);

    useEffect(() => {
        if (!user) return;

        // 1. Connect to Backend Signaling Server
        socketRef.current = io(BASE_URL);

        // 2. Request Camera & Mic Permissions
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // 3. Setup WebRTC Peer Connection
                peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

                // Add our video tracks to the connection
                stream.getTracks().forEach(track => {
                    peerConnectionRef.current.addTrack(track, stream);
                });

                // Listen for the other person's video tracks
                peerConnectionRef.current.ontrack = (event) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        setRemoteUserConnected(true);
                    }
                };

                // Send ICE network routing candidates to the server
                peerConnectionRef.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        socketRef.current.emit("ice-candidate", event.candidate);
                    }
                };

                // 4. Socket Listeners (The WebRTC Handshake)
                socketRef.current.emit('join-room', roomId, user._id);

                socketRef.current.on('user-connected', async () => {
                    // We are the caller. Create an Offer.
                    const offer = await peerConnectionRef.current.createOffer();
                    await peerConnectionRef.current.setLocalDescription(offer);
                    socketRef.current.emit("offer", offer);
                });

                socketRef.current.on('offer', async (offer) => {
                    // We received an Offer. Create an Answer.
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await peerConnectionRef.current.createAnswer();
                    await peerConnectionRef.current.setLocalDescription(answer);
                    socketRef.current.emit("answer", answer);
                });

                socketRef.current.on('answer', async (answer) => {
                    // Handshake complete
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                });

                socketRef.current.on('ice-candidate', async (candidate) => {
                    // Add remote network paths
                    try {
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error('Error adding received ice candidate', e);
                    }
                });

                socketRef.current.on('user-disconnected', () => {
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                    setRemoteUserConnected(false);
                });
            })
            .catch(err => {
                console.error("Camera access denied:", err);
                alert("Please allow camera and microphone access to use this feature.");
            });

        // Cleanup function when leaving the page
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) peerConnectionRef.current.close();
            if (socketRef.current) socketRef.current.disconnect();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, roomId]);

    // UI Controls
    const toggleMute = () => {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }
    };

    const endCall = () => {
        navigate('/dashboard');
    };

    if (!user) return <div style={{ height: '100vh', background: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>Loading securely...</div>;

    return (
        <div style={{ height: '100vh', width: '100vw', background: '#0f172a', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
            
            {/* Header */}
            <div style={{ padding: '15px 25px', background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚖️</span>
                    <h3 style={{ margin: 0, fontWeight: 'bold' }}>P2P Encrypted Consultation</h3>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Case: {roomId.slice(-6)}</div>
            </div>

            {/* Main Video Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                
                {/* Remote Video (Full Screen) */}
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
                />
                
                {!remoteUserConnected && (
                    <div style={{ position: 'absolute', color: '#cbd5e1', fontSize: '1.2rem', textAlign: 'center' }}>
                        <div className="loader" style={{ margin: '0 auto 15px auto' }}></div>
                        Waiting for the other party to join...
                    </div>
                )}

                {/* Local Video (Picture-in-Picture) */}
                <div style={{ 
                    position: 'absolute', bottom: '100px', right: '30px', 
                    width: '200px', height: '150px', 
                    borderRadius: '12px', overflow: 'hidden', 
                    border: '2px solid #3b82f6', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' 
                }}>
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted // Always mute local video to prevent echo
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} // Mirrored
                    />
                </div>
            </div>

            {/* Control Bar */}
            <div style={{ height: '80px', background: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <button 
                    onClick={toggleMute} 
                    style={{ background: isMuted ? '#ef4444' : '#334155', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '1.2rem', cursor: 'pointer', transition: '0.2s' }}
                >
                    {isMuted ? '🔇' : '🎤'}
                </button>
                <button 
                    onClick={endCall} 
                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '25px', padding: '0 30px', height: '50px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)' }}
                >
                    Hang Up
                </button>
                <button 
                    onClick={toggleVideo} 
                    style={{ background: isVideoOff ? '#ef4444' : '#334155', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '1.2rem', cursor: 'pointer', transition: '0.2s' }}
                >
                    {isVideoOff ? '🚫' : '📷'}
                </button>
            </div>
        </div>
    );
};

export default VideoCall;