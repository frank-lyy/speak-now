// @ts-ignore
import React, { useState, useRef } from 'react';
// import * as recorder from 'node-record-lpcm16';
import speech from "@google-cloud/speech"

const AudioRecorder: React.FC = () => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined);
    const [transcript, setTranscript] = useState("");
    const mediaRecorderRef = useRef(new MediaRecorder(new MediaStream()));

    const startRecording = () => {
        setRecording(true);
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.start();

            const audioChunks: any[] = [];
            mediaRecorderRef.current.ondataavailable = event => {
            audioChunks.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            setAudioBlob(audioBlob);
            };
        });
    };

    const stopRecording = () => {
        setRecording(false);
        mediaRecorderRef.current.stop();
    };

    const handleRecordButtonClick = () => {
        if (recording) {
            stopRecording();
            console.log('Recording stopped');
        } else {
            startRecording();
        }
    };

    const sendAudioToServer = () => {
        if (!audioBlob) return;
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        
        fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Transcription:', data.transcription);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };


    return (
        <div>
            <h1>Audio Recorder</h1>
            <button onClick={handleRecordButtonClick}>
                {recording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button onClick={sendAudioToServer}>Transcribe Audio</button>
        </div>
    )
}

export default AudioRecorder;
