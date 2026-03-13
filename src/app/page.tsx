"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  type VelocityData,
  requestGpsPermission,
  startGpsTracking,
  stopGpsTracking,
  processManualSpeed,
  resetVelocityState,
  MAX_SPEED,
  type GpsPermissionState,
} from "@/lib/velocity";
import { mapVelocityToAudio, resetMappingState, type VelocityAudioState } from "@/lib/mapping";
import { ToneAudioController } from "@/lib/audioEngine";
import MotionDisplay from "@/components/MotionDisplay";
import AudioStateDisplay from "@/components/AudioStateDisplay";
import AccelerationGraph from "@/components/AccelerationGraph";

const MAX_HISTORY = 100;

const defaultVelocity: VelocityData = {
  speed: 0,
  smoothedSpeed: 0,
  normalized: 0,
  accuracy: null,
  source: "manual",
};

const defaultAudioState: VelocityAudioState = {
  engineState: "idle",
  frequency: 50,
  normalized: 0,
};

type InputMode = "gps" | "manual";

export default function Home() {
  const [gpsPermission, setGpsPermission] = useState<GpsPermissionState>("prompt");
  const [velocityData, setVelocityData] = useState<VelocityData>(defaultVelocity);
  const [audioState, setAudioState] = useState<VelocityAudioState>(defaultAudioState);
  const [audioStarted, setAudioStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ time: number; speed: number; frequency: number }[]>([]);
  const [manualSpeed, setManualSpeed] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>("gps");

  const engineRef = useRef<ToneAudioController | null>(null);
  const startTimeRef = useRef(Date.now());

  // Apply velocity data to audio
  const applyVelocity = useCallback((data: VelocityData) => {
    setVelocityData(data);

    const state = mapVelocityToAudio(data.normalized);
    setAudioState(state);
    engineRef.current?.setFrequency(data.normalized);

    setHistory((prev) => {
      const next = [
        ...prev,
        {
          time: (Date.now() - startTimeRef.current) / 1000,
          speed: data.normalized,
          frequency: state.frequency / 1000, // scale to 0-1 for graph
        },
      ];
      return next.slice(-MAX_HISTORY);
    });
  }, []);

  // GPS callback
  const handleGpsUpdate = useCallback((data: VelocityData) => {
    applyVelocity(data);
  }, [applyVelocity]);

  // Handle manual speed slider changes
  useEffect(() => {
    if (inputMode !== "manual" || !audioStarted) return;
    const data = processManualSpeed(manualSpeed);
    applyVelocity(data);
  }, [manualSpeed, inputMode, audioStarted, applyVelocity]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      stopGpsTracking();
    };
  }, []);

  async function handleStart() {
    setError(null);
    resetMappingState();
    resetVelocityState();
    startTimeRef.current = Date.now();
    setHistory([]);

    try {
      if (!engineRef.current) {
        engineRef.current = new ToneAudioController();
      }

      await engineRef.current.start();
      setAudioStarted(true);

      if (inputMode === "gps") {
        const perm = await requestGpsPermission();
        setGpsPermission(perm);

        if (perm === "granted") {
          startGpsTracking(handleGpsUpdate);
        } else if (perm === "not-supported") {
          setError("GPS not available on this device. Switching to manual mode.");
          setInputMode("manual");
        } else {
          setError("GPS permission denied. Switching to manual mode.");
          setInputMode("manual");
        }
      }
    } catch (err) {
      setError(`Failed to start: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function handleStop() {
    engineRef.current?.stop();
    setAudioStarted(false);
    stopGpsTracking();
  }

  function handleModeToggle(mode: InputMode) {
    setInputMode(mode);
    resetVelocityState();
    resetMappingState();

    if (audioStarted) {
      if (mode === "gps") {
        requestGpsPermission().then((perm) => {
          setGpsPermission(perm);
          if (perm === "granted") {
            startGpsTracking(handleGpsUpdate);
          } else {
            setError("GPS not available. Staying in manual mode.");
            setInputMode("manual");
          }
        });
      } else {
        stopGpsTracking();
        setManualSpeed(0);
      }
    }
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Bicycle Speed → Tone</h1>
        <p>GPS velocity mapped to {"\u00A0"}50–1000 Hz</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!audioStarted ? (
        <button className="start-btn" onClick={handleStart}>
          TAP TO START
        </button>
      ) : (
        <button className="start-btn active" onClick={handleStop}>
          STOP
        </button>
      )}

      {/* Input mode toggle */}
      <div className="panel">
        <h2>Input Mode</h2>
        <div className="toggle-row">
          <button
            className={`toggle-btn ${inputMode === "gps" ? "toggle-active" : ""}`}
            onClick={() => handleModeToggle("gps")}
          >
            GPS
          </button>
          <button
            className={`toggle-btn ${inputMode === "manual" ? "toggle-active" : ""}`}
            onClick={() => handleModeToggle("manual")}
          >
            Manual
          </button>
        </div>
        {inputMode === "gps" && (
          <p className="sim-note">
            GPS Status: {gpsPermission === "granted" ? "Tracking" : gpsPermission}
          </p>
        )}
      </div>

      {/* Manual speed slider */}
      {inputMode === "manual" && (
        <div className="sim-panel">
          <h2>Manual Speed Control</h2>
          <p className="sim-note">
            Drag to simulate bicycle speed (0 – {MAX_SPEED} m/s)
          </p>
          <input
            type="range"
            className="sim-slider"
            min={0}
            max={MAX_SPEED}
            step={0.01}
            value={manualSpeed}
            onChange={(e) => setManualSpeed(parseFloat(e.target.value))}
          />
          <div className="speed-label">{manualSpeed.toFixed(2)} m/s</div>
        </div>
      )}

      <MotionDisplay data={velocityData} />
      <AudioStateDisplay
        audioState={audioState}
        audioStarted={audioStarted}
      />
      <AccelerationGraph history={history} />
    </div>
  );
}
