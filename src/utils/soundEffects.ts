// Web Audio API Sound Synthesizer for tactile feedback
// Works hermetically without any external asset dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('finpulse_sound_enabled');
      if (saved !== null) {
        this.enabled = JSON.parse(saved);
      }
    } catch {
      this.enabled = true;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('finpulse_sound_enabled', JSON.stringify(val));
    } catch {
      // ignore
    }
  }

  public toggle(): boolean {
    const next = !this.enabled;
    this.setEnabled(next);
    if (next) {
      this.playSuccess();
    }
    return next;
  }

  // Harmonic chime for milestone / transaction completion
  public playSuccess() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Major chord chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.36);
    });
  }

  // Soft subtle click for tabs and button toggles
  public playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Cheerful chord when creating income or budget
  public playAdd() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [440, 554.37, 659.25];
    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.04);

      gain.gain.setValueAtTime(0, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.09, now + i * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.29);
    });
  }

  // Warning / Alert notification sound
  public playAlert() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.setValueAtTime(320, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }
}

export const sounds = new SoundManager();
