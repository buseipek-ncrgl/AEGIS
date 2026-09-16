// Taktik Radar Siren Ses Jeneratörü (Web Audio API)
// Harici ses dosyasına ihtiyaç duymaz, tarayıcının yerel ses sentezleyicisini kullanır.

let audioCtx: AudioContext | null = null;

export function playTacticalSiren(type: "critical" | "warning" | "ack" = "critical") {
  try {
    if (typeof window === "undefined") return;

    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    if (type === "critical") {
      // Çift tonlu kritik taktik siren (880Hz -> 440Hz -> 880Hz)
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "square";

      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(220, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } else if (type === "warning") {
      // Tekli ikaz bipi (600Hz)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "ack") {
      // Onay bipi (1200Hz yumuşak)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (err) {
    console.warn("Taktik siren sesi çalınamadı:", err);
  }
}
