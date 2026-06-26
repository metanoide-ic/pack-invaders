/**
 * TWITCH CHAT INTEGRATION — Anonymous read-only connection to Twitch IRC.
 * Lets viewers interact with the streamer's game via chat commands.
 * Fully optional: game works perfectly without it.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type TwitchEventType =
  | 'help' | 'curse' | 'gold' | 'boss' | 'speed' | 'slow' | 'shield' | 'chaos';

export interface TwitchEvent {
  type: TwitchEventType;
  username: string;
  timestamp: number;
}

export interface TwitchVoteResult {
  winner: string;
  votes: Map<string, number>;
  totalVotes: number;
}

export interface TwitchNotification {
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

// ─── Main Class ──────────────────────────────────────────────────────────────

export class TwitchIntegration {
  private ws: WebSocket | null = null;
  private channel: string = '';
  private _enabled: boolean = false;
  private _connected: boolean = false;
  private _connecting: boolean = false;
  private _error: string = '';

  // Vote system
  private votePool: Map<string, number> = new Map();
  private voters: Set<string> = new Set();
  private voteActive: boolean = false;
  private voteOptions: string[] = [];
  private voteStartTime: number = 0;
  private voteDuration: number = 15000; // 15 seconds

  // Event queue
  private eventQueue: TwitchEvent[] = [];
  private lastEventTime: number = 0;
  private cooldown: number = 30000; // 30s between events

  // Notifications for rendering
  notifications: TwitchNotification[] = [];

  // Active effects
  speedMultiplier: number = 1;
  private speedEffectTimer: number = 0;
  shieldActive: boolean = false;
  curseNextWave: boolean = false;
  bossNextWave: boolean = false;

  get enabled(): boolean { return this._enabled; }
  get connected(): boolean { return this._connected; }
  get connecting(): boolean { return this._connecting; }
  get error(): string { return this._error; }
  get channelName(): string { return this.channel; }

  // ─── Connection ─────────────────────────────────────────────────────────

  connect(channel: string): void {
    if (this._connected || this._connecting) {
      this.disconnect();
    }

    this.channel = channel.toLowerCase().replace(/^#/, '');
    if (!this.channel) {
      this._error = 'Canal inválido';
      return;
    }

    this._connecting = true;
    this._error = '';
    this._enabled = true;

    try {
      this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

      this.ws.onopen = () => {
        if (!this.ws) return;
        this.ws.send('CAP REQ :twitch.tv/commands twitch.tv/tags');
        const nick = `justinfan${Math.floor(Math.random() * 99999)}`;
        this.ws.send(`NICK ${nick}`);
        this.ws.send(`JOIN #${this.channel}`);
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data as string);
      };

      this.ws.onclose = () => {
        this._connected = false;
        this._connecting = false;
      };

      this.ws.onerror = () => {
        this._error = 'Erro na conexão';
        this._connected = false;
        this._connecting = false;
      };
    } catch {
      this._error = 'WebSocket não disponível';
      this._connecting = false;
    }

    // Persist channel
    localStorage.setItem('packinvaders_twitch_channel', this.channel);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._connected = false;
    this._connecting = false;
    this._enabled = false;
    this.channel = '';
  }

  // ─── Message Parsing ────────────────────────────────────────────────────

  private handleMessage(raw: string): void {
    const lines = raw.split('\r\n').filter(l => l.length > 0);

    for (const line of lines) {
      // Respond to PING
      if (line.startsWith('PING')) {
        this.ws?.send('PONG :tmi.twitch.tv');
        continue;
      }

      // Connection confirmation
      if (line.includes('366')) {
        this._connected = true;
        this._connecting = false;
        this.addNotification('Conectado à Twitch!', '#4ade80');
        continue;
      }

      // Parse PRIVMSG
      if (line.includes('PRIVMSG')) {
        this.parseChatMessage(line);
      }
    }
  }

  private parseChatMessage(line: string): void {
    // Extract username
    const userMatch = line.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG/);
    if (!userMatch) return;
    const username = userMatch[1];

    // Extract message text
    const msgMatch = line.match(/PRIVMSG #\w+ :(.+)/);
    if (!msgMatch) return;
    const msg = msgMatch[1].trim().toLowerCase();

    // Check vote commands first
    if (this.voteActive) {
      this.handleVoteCommand(username, msg);
    }

    // Check event commands
    this.handleEventCommand(username, msg);
  }

  // ─── Event Commands ─────────────────────────────────────────────────────

  private handleEventCommand(username: string, msg: string): void {
    const now = Date.now();
    if (now - this.lastEventTime < this.cooldown) return;

    let eventType: TwitchEventType | null = null;

    switch (msg) {
      case '!help': eventType = 'help'; break;
      case '!curse': eventType = 'curse'; break;
      case '!gold': eventType = 'gold'; break;
      case '!boss': eventType = 'boss'; break;
      case '!speed': eventType = 'speed'; break;
      case '!slow': eventType = 'slow'; break;
      case '!shield': eventType = 'shield'; break;
      case '!chaos': eventType = 'chaos'; break;
    }

    if (eventType) {
      this.eventQueue.push({ type: eventType, username, timestamp: now });
      this.lastEventTime = now;
    }
  }

  // ─── Vote System ────────────────────────────────────────────────────────

  startVote(options: string[]): void {
    this.votePool.clear();
    this.voters.clear();
    this.voteActive = true;
    this.voteOptions = options;
    this.voteStartTime = Date.now();

    for (const opt of options) {
      this.votePool.set(opt, 0);
    }
  }

  private handleVoteCommand(username: string, msg: string): void {
    if (this.voters.has(username)) return; // One vote per user

    const vote = msg.replace('!', '').toUpperCase();
    if (this.voteOptions.includes(vote)) {
      this.voters.add(username);
      const current = this.votePool.get(vote) || 0;
      this.votePool.set(vote, current + 1);
    }
  }

  endVote(): TwitchVoteResult {
    this.voteActive = false;
    let winner = this.voteOptions[0] || 'A';
    let maxVotes = 0;
    let totalVotes = 0;

    for (const [option, count] of this.votePool) {
      totalVotes += count;
      if (count > maxVotes) {
        maxVotes = count;
        winner = option;
      }
    }

    // If no votes, pick random
    if (totalVotes === 0) {
      winner = this.voteOptions[Math.floor(Math.random() * this.voteOptions.length)] || 'A';
    }

    return { winner, votes: new Map(this.votePool), totalVotes };
  }

  isVoteActive(): boolean {
    return this.voteActive;
  }

  getVoteTimeRemaining(): number {
    if (!this.voteActive) return 0;
    const elapsed = Date.now() - this.voteStartTime;
    return Math.max(0, this.voteDuration - elapsed);
  }

  isVoteExpired(): boolean {
    if (!this.voteActive) return false;
    return Date.now() - this.voteStartTime >= this.voteDuration;
  }

  getVoteCounts(): Map<string, number> {
    return new Map(this.votePool);
  }

  getVoteOptions(): string[] {
    return [...this.voteOptions];
  }

  // ─── Event Processing ───────────────────────────────────────────────────

  getNextEvent(): TwitchEvent | null {
    return this.eventQueue.shift() || null;
  }

  hasEvents(): boolean {
    return this.eventQueue.length > 0;
  }

  // ─── Effect Timers ──────────────────────────────────────────────────────

  update(dt: number): void {
    // Speed effect timer
    if (this.speedEffectTimer > 0) {
      this.speedEffectTimer -= dt;
      if (this.speedEffectTimer <= 0) {
        this.speedMultiplier = 1;
        this.speedEffectTimer = 0;
      }
    }

    // Update notifications
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      this.notifications[i].life -= dt;
      if (this.notifications[i].life <= 0) {
        this.notifications.splice(i, 1);
      }
    }
  }

  applySpeedEffect(multiplier: number, duration: number): void {
    this.speedMultiplier = multiplier;
    this.speedEffectTimer = duration;
  }

  // ─── Notifications ──────────────────────────────────────────────────────

  addNotification(text: string, color: string): void {
    // Cap notifications
    if (this.notifications.length > 5) {
      this.notifications.shift();
    }
    this.notifications.push({ text, color, life: 4, maxLife: 4 });
  }

  // ─── Persistence ───────────────────────────────────────────────────────

  static getSavedChannel(): string {
    return localStorage.getItem('packinvaders_twitch_channel') || '';
  }

  isConnected(): boolean {
    return this._connected;
  }
}
