import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {continueRender, delayRender} from 'remotion';

// Fonts are served from public/fonts (headless Chrome can't fetch Google Fonts here).
const INTER = 'KaiInter';
const SERIF = 'KaiSerif';
const MONO = 'KaiMono';
const FONT_FILES: [string, string, string, string][] = [
  [INTER, 'fonts/Inter-Medium.otf', '500', 'normal'],
  [INTER, 'fonts/Inter-Bold.otf', '700', 'normal'],
  [INTER, 'fonts/Inter-ExtraBold.otf', '800', 'normal'],
  [INTER, 'fonts/Inter-Black.otf', '900', 'normal'],
  [SERIF, 'fonts/InstrumentSerif-Italic.woff2', '400', 'italic'],
  [MONO, 'fonts/JetBrainsMono-Medium.woff2', '500', 'normal'],
];
if (typeof document !== 'undefined') {
  const handle = delayRender('fonts');
  Promise.all(
    FONT_FILES.map(([family, file, weight, style]) => {
      const f = new FontFace(family, `url(${staticFile(file)})`, {weight, style});
      return f.load().then((loaded) => document.fonts.add(loaded));
    }),
  ).then(() => continueRender(handle));
}

// ---------- spec ----------
export type Word = {text: string; start: number; end: number};
export type Beat = {
  start: number;
  end: number;
  layout: 'split' | 'full';
  panel?: Panel;
  sfx?: 'whoosh' | 'pop' | 'boom';
};
export type Panel =
  | {type: 'chat'; label: string; text: string}
  | {type: 'avatar'; label: string}
  | {type: 'wave'; label: string}
  | {type: 'cards'; items: string[]; delays?: number[]}
  | {type: 'approve'}
  | {type: 'stamp'; text: string; sub?: string}
  | {type: 'counter'; from: number; to: number; label: string; crash?: boolean}
  | {type: 'follow'; handle: string}
  | {type: 'headline'; top: string; accent: string};
export type Caption = {start: number; end: number; text: string; key?: string};
export type ReelSpec = {
  video: string;
  duration: number;
  beats: Beat[];
  captions: Caption[];
  hud?: {left: string; right?: string};
};

// ---------- palette (Zoom-video reference look, Kai accent) ----------
const BLUE_TOP = '#0b1f9e';
const BLUE_DEEP = '#020a3a';
const ACCENT = '#7aa2ff';
const SEAM = 960;

const sec = (s: number, fps: number) => Math.round(s * fps);

const ContinuousKai: React.FC<{spec: ReelSpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const beat = spec.beats.find((b) => t >= b.start && t < b.end) ?? spec.beats[spec.beats.length - 1];
  const local = frame - sec(beat.start, fps);
  const push = interpolate(local, [0, 90], [1.12, 1.2], {extrapolateRight: 'clamp'});
  const full = beat.layout === 'full';
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: full ? 0 : SEAM,
        width: 1080,
        height: full ? 1920 : 1920 - SEAM,
        overflow: 'hidden',
      }}
    >
      <OffthreadVideo
        src={staticFile(spec.video)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: full ? '50% 40%' : '50% 45%',
          transform: `scale(${full ? push : 1.3})`,
          transformOrigin: full ? '50% 50%' : '50% 38%',
        }}
      />
    </div>
  );
};

// ---------- panels ----------
const usePop = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 160}});
};

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      background: 'white',
      borderRadius: 28,
      boxShadow: '0 30px 80px rgba(0,0,20,0.45)',
      padding: 36,
      ...style,
    }}
  >
    {children}
  </div>
);

const Label: React.FC<{text: string}> = ({text}) => (
  <div style={{fontFamily: MONO, color: 'rgba(255,255,255,0.55)', fontSize: 26, letterSpacing: 4, marginBottom: 28, textTransform: 'uppercase'}}>
    {'// ' + text}
  </div>
);

const ChatPanel: React.FC<{label: string; text: string}> = ({label, text}) => {
  const frame = useCurrentFrame();
  const p = usePop();
  const chars = Math.floor(interpolate(frame, [6, 6 + text.length * 1.4], [0, text.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <div style={{transform: `scale(${0.9 + 0.1 * p})`, opacity: p, width: 860}}>
      <Label text={label} />
      <Card style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{fontFamily: INTER, fontWeight: 500, fontSize: 44, color: '#111', flex: 1, minHeight: 56}}>
          {text.slice(0, chars)}
          <span style={{opacity: frame % 20 < 10 ? 1 : 0, color: '#4964F5'}}>|</span>
        </div>
        <div style={{width: 72, height: 72, borderRadius: 36, background: '#4964F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 40, fontFamily: INTER, fontWeight: 800}}>↑</div>
      </Card>
    </div>
  );
};

const AvatarPanel: React.FC<{label: string}> = ({label}) => {
  const frame = useCurrentFrame();
  const p = usePop();
  const scanY = interpolate(frame % 45, [0, 45], [0, 100]);
  return (
    <div style={{transform: `scale(${0.85 + 0.15 * p})`, opacity: p, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Label text={label} />
      <div style={{position: 'relative', width: 680, height: 480, borderRadius: 28, overflow: 'hidden', border: `4px solid ${ACCENT}`, boxShadow: '0 30px 80px rgba(0,0,20,0.5)'}}>
        <Img src={staticFile('kai_still.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 35%'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: `${scanY}%`, height: 6, background: ACCENT, boxShadow: `0 0 30px 10px ${ACCENT}`, opacity: 0.9}} />
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(122,162,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(122,162,255,0.18) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div style={{position: 'absolute', left: 20, bottom: 20, background: '#4964F5', color: 'white', fontFamily: MONO, fontSize: 26, padding: '8px 18px', borderRadius: 12}}>AVATAR · NOT A CAMERA</div>
      </div>
    </div>
  );
};

const WavePanel: React.FC<{label: string}> = ({label}) => {
  const frame = useCurrentFrame();
  const p = usePop();
  const bars = 36;
  return (
    <div style={{opacity: p, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Label text={label} />
      <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 300}}>
        {new Array(bars).fill(0).map((_, i) => {
          const h = 40 + 220 * Math.abs(Math.sin(i * 0.55 + frame * 0.35) * Math.cos(i * 0.21 - frame * 0.12));
          return <div key={i} style={{width: 14, height: h * p, borderRadius: 7, background: i % 3 === 0 ? 'white' : ACCENT}} />;
        })}
      </div>
      <div style={{fontFamily: MONO, color: 'white', fontSize: 30, marginTop: 24, opacity: 0.8}}>voice: synthetic ✓</div>
    </div>
  );
};

const CardsPanel: React.FC<{items: string[]; delays?: number[]}> = ({items, delays}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 26, width: 760}}>
      <Label text="who does what" />
      {items.map((it, i) => {
        const d = delays ? Math.round(delays[i] * fps) : i * 10;
        const p = spring({frame: frame - d, fps, config: {damping: 12, stiffness: 180}});
        return (
          <div key={it} style={{transform: `translateX(${(1 - p) * 120}px) scale(${0.9 + 0.1 * p})`, opacity: p}}>
            <Card style={{display: 'flex', alignItems: 'center', gap: 26, padding: '26px 34px'}}>
              <div style={{width: 54, height: 54, borderRadius: 27, background: '#4964F5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 800, fontSize: 32}}>✓</div>
              <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 52, color: '#111', letterSpacing: 1}}>{it}</div>
              <div style={{marginLeft: 'auto', fontFamily: MONO, fontSize: 26, color: '#4964F5'}}>CLAUDE</div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

const ApprovePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop();
  const click = frame > 18 && frame < 26;
  const cursorX = interpolate(frame, [0, 16], [260, 60], {extrapolateRight: 'clamp'});
  const cursorY = interpolate(frame, [0, 16], [220, 40], {extrapolateRight: 'clamp'});
  const done = frame >= 22;
  return (
    <div style={{position: 'relative', opacity: p, transform: `scale(${0.9 + 0.1 * p})`}}>
      <Label text="1 human" />
      <div style={{width: 640, padding: '44px 0', borderRadius: 30, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 72, letterSpacing: 4, background: done ? '#22c55e' : 'white', color: done ? 'white' : '#111', transform: `scale(${click ? 0.94 : 1})`, boxShadow: '0 30px 80px rgba(0,0,20,0.45)'}}>
        {done ? 'APPROVED ✓' : 'APPROVE'}
      </div>
      <div style={{position: 'absolute', left: 320 + cursorX, top: 120 + cursorY, fontSize: 90, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}>👆</div>
    </div>
  );
};

const StampPanel: React.FC<{text: string; sub?: string}> = ({text, sub}) => {
  const p = usePop(2);
  const s = interpolate(p, [0, 1], [2.2, 1]);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{transform: `scale(${s}) rotate(-6deg)`, opacity: Math.min(1, p * 1.5), border: `10px solid ${ACCENT}`, color: ACCENT, borderRadius: 24, padding: '20px 54px', fontFamily: INTER, fontWeight: 900, fontSize: 104, letterSpacing: 6}}>{text}</div>
      {sub ? <div style={{fontFamily: SERIF, fontStyle: 'italic', color: 'white', fontSize: 64, marginTop: 50, opacity: p}}>{sub}</div> : null}
    </div>
  );
};

const CounterPanel: React.FC<{from: number; to: number; label: string; crash?: boolean}> = ({from, to, label, crash}) => {
  const frame = useCurrentFrame();
  const p = usePop();
  const v = Math.round(interpolate(frame, [0, crash ? 8 : 40], [from, to], {extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3)}));
  const shake = crash && frame < 14 ? Math.sin(frame * 3) * 14 : 0;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p, transform: `translateX(${shake}px)`}}>
      <Label text={label} />
      <div style={{fontFamily: INTER, fontWeight: 900, fontSize: crash ? 360 : 240, color: crash ? '#ff5a5a' : 'white', lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{v.toLocaleString('en-US')}</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', color: ACCENT, fontSize: 72, marginTop: 10}}>followers</div>
    </div>
  );
};

const FollowPanel: React.FC<{handle: string}> = ({handle}) => {
  const frame = useCurrentFrame();
  const p = usePop();
  const pulse = 1 + 0.05 * Math.sin(frame * 0.4);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p}}>
      <div style={{width: 230, height: 230, borderRadius: 115, overflow: 'hidden', border: `6px solid ${ACCENT}`, marginBottom: 30}}>
        <Img src={staticFile('kai_still.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}} />
      </div>
      <div style={{fontFamily: INTER, fontWeight: 700, color: 'white', fontSize: 50, marginBottom: 34}}>{handle}</div>
      <div style={{transform: `scale(${pulse * (0.85 + 0.15 * p)})`, background: '#4964F5', color: 'white', fontFamily: INTER, fontWeight: 800, fontSize: 60, padding: '26px 110px', borderRadius: 22}}>Follow</div>
    </div>
  );
};

const HeadlinePanel: React.FC<{top: string; accent: string}> = ({top, accent}) => {
  const p = usePop();
  return (
    <div style={{textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
      <div style={{fontFamily: INTER, fontWeight: 800, color: 'white', fontSize: 76}}>{top}</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', color: ACCENT, fontSize: 110, borderBottom: `5px solid ${ACCENT}`, display: 'inline-block', lineHeight: 1.1}}>{accent}</div>
    </div>
  );
};

const PanelView: React.FC<{panel: Panel}> = ({panel}) => {
  switch (panel.type) {
    case 'chat':
      return <ChatPanel {...panel} />;
    case 'avatar':
      return <AvatarPanel {...panel} />;
    case 'wave':
      return <WavePanel {...panel} />;
    case 'cards':
      return <CardsPanel {...panel} />;
    case 'approve':
      return <ApprovePanel />;
    case 'stamp':
      return <StampPanel {...panel} />;
    case 'counter':
      return <CounterPanel {...panel} />;
    case 'follow':
      return <FollowPanel {...panel} />;
    case 'headline':
      return <HeadlinePanel {...panel} />;
  }
};

// ---------- captions ----------
const CaptionView: React.FC<{c: Caption; layout: 'split' | 'full'}> = ({c, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 16, stiffness: 220}});
  const words = c.text.split(' ');
  const top = layout === 'split' ? SEAM - 70 : 1440;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', gap: 18, transform: `scale(${0.85 + 0.15 * p})`, opacity: p}}>
      {words.map((w, i) => {
        const isKey = c.key && w.toLowerCase().replace(/[^a-z0-9,']/g, '') === c.key.toLowerCase();
        return isKey ? (
          <span key={i} style={{fontFamily: SERIF, fontStyle: 'italic', color: ACCENT, fontSize: 78, lineHeight: '96px', textShadow: '0 4px 24px rgba(0,0,40,0.6)'}}>{w.toLowerCase()}</span>
        ) : (
          <span key={i} style={{fontFamily: INTER, fontWeight: 800, color: 'white', fontSize: 58, lineHeight: '96px', letterSpacing: 2, textTransform: 'uppercase', textShadow: '0 4px 24px rgba(0,0,40,0.7)'}}>{w}</span>
        );
      })}
    </div>
  );
};

// ---------- the reel ----------
export const KaiReel: React.FC<{specFile: string; spec?: ReelSpec}> = ({spec}) => {
  const {fps} = useVideoConfig();
  if (!spec) return null;
  const sfxSrc = {whoosh: 'whoosh.wav', pop: 'pop.wav', boom: 'boom.wav'};
  return (
    <AbsoluteFill style={{background: BLUE_DEEP}}>
      {spec.beats.map((b, i) => (
        <Sequence key={i} from={sec(b.start, fps)} durationInFrames={Math.max(1, sec(b.end, fps) - sec(b.start, fps))}>
          <AbsoluteFill>
            {b.layout === 'split' ? (
              <>
                <AbsoluteFill style={{height: SEAM, background: `radial-gradient(120% 90% at 50% 0%, ${BLUE_TOP} 0%, ${BLUE_DEEP} 75%)`}} />
                <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: SEAM, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40}}>
                  {b.panel ? <PanelView panel={b.panel} /> : null}
                </div>
              </>
            ) : null}
          </AbsoluteFill>
          {b.sfx ? <Audio src={staticFile(sfxSrc[b.sfx])} volume={0.35} /> : null}
        </Sequence>
      ))}

      {/* Kai: ONE continuous take for the whole reel. Only the framing changes per beat;
          the clip itself is never restarted (a Sequence per beat would replay it from 0). */}
      <ContinuousKai spec={spec} />

      {/* seam shadow so captions read on the cut line */}
      {spec.beats.map((b, i) =>
        b.layout === 'split' ? (
          <Sequence key={'g' + i} from={sec(b.start, fps)} durationInFrames={Math.max(1, sec(b.end, fps) - sec(b.start, fps))}>
            <div style={{position: 'absolute', left: 0, right: 0, top: SEAM - 120, height: 260, background: 'linear-gradient(180deg, rgba(2,10,58,0) 0%, rgba(2,10,58,0.85) 45%, rgba(2,10,58,0) 100%)'}} />
          </Sequence>
        ) : null,
      )}

      {/* captions, layout follows whichever beat they fall in */}
      {spec.captions.map((c, i) => {
        const beat = spec.beats.find((b) => c.start >= b.start - 0.01 && c.start < b.end) ?? spec.beats[0];
        return (
          <Sequence key={'c' + i} from={sec(c.start, fps)} durationInFrames={Math.max(1, sec(c.end, fps) - sec(c.start, fps))}>
            <CaptionView c={c} layout={beat.layout} />
          </Sequence>
        );
      })}

      {/* HUD + AI label (brand rule: every post is labelled AI) */}
      <div style={{position: 'absolute', top: 70, left: 60, fontFamily: MONO, fontSize: 26, color: 'rgba(255,255,255,0.75)', letterSpacing: 3}}>{spec.hud?.left ?? ''}</div>
      <div style={{position: 'absolute', top: 62, right: 60, fontFamily: MONO, fontSize: 24, color: 'white', background: 'rgba(73,100,245,0.85)', padding: '6px 16px', borderRadius: 10}}>{spec.hud?.right ?? 'AI-MADE'}</div>
    </AbsoluteFill>
  );
};
