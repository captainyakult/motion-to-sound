"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  processMotionEvent,
  requestMotionPermission,
  type MotionData,
  type MotionPermissionState,
} from "@/lib/motion";
import { mapAccelerationToAudio, resetMappingState, type AudioBlend } from "@/lib/mapping";
import { EngineAudioController } from "@/lib/audioEngine";
import MotionDisplay from "@/components/MotionDisplay";
import AudioStateDisplay from "@/components/AudioStateDisplay";
import AccelerationGraph from "@/components/AccelerationGraph";

const MAX_HISTORY = 100;

const defaultMotion: MotionData = {
  x: 0, y: 0, z: 0, magnitude: 0, normalized: 0,
};

const defaultBlend: AudioBlend = {
  idleVolume: 1, accelVolume: 0, decelVolume: 0,
  engineState: "idle", playbackRate: 0.8,
};

export default function Home() {
  const [permissionState, setPermissionState] = useState<MotionPermissionState>("prompt");
  const [motionData, setMotionData] = useState<MotionData>(defaultMotion);
  const [blend, setBlend] = useState<AudioBlend>(defaultBlend);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ time: number; magnitude: number; normalized: number }[]>([]);
  const [simValue, setSimValue] = useState(0);
  const [useSimulator, setUseSimulator] = useState(false);

  const engineRef = useRef<EngineAudioController | null>(null);
  const startTimeRef = useRef(Date.now());

  // Handle real motion events
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const data = processMotionEvent(event);
    setMotionData(data);

    const audioBlend = mapAccelerationToAudio(data.normalized);
    setBlend(audioBlend);
    engineRef.current?.setThrottle(audioBlend);

    setHistory((prev) => {
      const next = [
        ...prev,
        {
          time: (Date.now() - startTimeRef.current) / 1000,
          magnitude: Math.min(1, data.magnitude / 20),
          normalized: data.normalized,
        },
      ];
      return next.slice(-MAX_HISTORY);
    });
  }, []);

  // Handle simulator input
  useEffect(() => {
    if (!useSimulator) return;

    const data: MotionData = {
      x: simValue * 5,
      y: 0,
      z: 9.8,
      magnitude: simValue * 20,
      normalized: simValue,
    };
    setMotionData(data);

    const audioBlend = mapAccelerationToAudio(data.normalized);
    setBlend(audioBlend);
    engineRef.current?.setThrottle(audioBlend);

    setHistory((prev) => {
      const next = [
        ...prev,
        {
          time: (Date.now() - startTimeRef.current) / 1000,
          magnitude: simValue,
          normalized: simValue,
        },
      ];
      return next.slice(-MAX_HISTORY);
    });
  }, [simValue, useSimulator]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
    };
  }, []);

  async function handleStart() {
    setError(null);
    resetMappingState();
    startTimeRef.current = Date.now();

    try {
      // Initialize audio engine
      if (!engineRef.current) {
        engineRef.current = new EngineAudioController();
        await engineRef.current.load();
        setAudioLoaded(true);
      }

      await engineRef.current.start();
      setAudioStarted(true);

      // Try to get motion permission
      const perm = await requestMotionPermission();
      setPermissionState(perm);

      if (perm === "granted") {
        window.addEventListener("devicemotion", handleMotion);
        setUseSimulator(false);
      } else if (perm === "not-supported") {
        setUseSimulator(true);
      } else {
        setError("Motion permission denied. Using simulator instead.");
        setUseSimulator(true);
      }
    } catch (err) {
      setError(`Failed to start: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function handleStop() {
    engineRef.current?.stop();
    setAudioStarted(false);
    window.removeEventListener("devicemotion", handleMotion);
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Engine Sound Prototype</h1>
        <p>Phone Accelerometer → Car Engine Audio</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!audioStarted ? (
        <button className="start-btn" onClick={handleStart}>
          TAP TO START ENGINE
        </button>
      ) : (
        <button className="start-btn active" onClick={handleStop}>
          STOP ENGINE
        </button>
      )}

      {useSimulator && audioStarted && (
        <div className="sim-panel">
          <h2>Accelerometer Simulator</h2>
          <p className="sim-note">
            {permissionState === "not-supported"
              ? "DeviceMotion not available — use slider to simulate acceleration"
              : "Motion denied — use slider to simulate"}
          </p>
          <input
            type="range"
            className="sim-slider"
            min={0}
            max={1}
            step={0.01}
            value={simValue}
            onChange={(e) => setSimValue(parseFloat(e.target.value))}
          />
        </div>
      )}

      <MotionDisplay data={motionData} />
      <AudioStateDisplay
        blend={blend}
        audioLoaded={audioLoaded}
        audioStarted={audioStarted}
      />
      <AccelerationGraph history={history} />
    </div>
  );
}
