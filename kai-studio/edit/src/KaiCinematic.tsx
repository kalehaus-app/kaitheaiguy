import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// "Cinematic + bold" Kai format (decided Nov 18, refs: @rourke, @sebintel):
// Kai talks full screen in ONE continuous take; AI-generated cutaways of Kai act out each line;
// giant uppercase captions with the key word in Kai yellow; whoosh/boom on every cut.

const INTER = 'KaiInter';
const MONO = 'KaiMono';
if (typeof document !== 'undefined') {
  const handle = delayRender('fonts');
  const files: [string, string, string][] = [
    [INTER, 'fonts/Inter-Black.otf', '900'],
    [INTER, 'fonts/Inter-ExtraBold.otf', '800'],
    [MONO, 'fonts/JetBrainsMono-Medium.woff2', '500'],
  ];
  Promise.all(
    files.map(([family, file, weight]) =>
      new FontFace(family, `url(${staticFile(file)})`, {weight}).load().then((f) => (document.fonts as any).add(f)),
    ),
  ).then(() => continueRender(handle));
}

const YELLOW = '#FFE14D';

export type Cut = {start: number; end: number; src: string; kind: 'video' | 'image'; sfx?: 'whoosh' | 'boom' | 'pop'};
export type Cap = {start: number; end: number; text: string; key?: string};
export type Punch = {start: number; end: number; zoom: number};
export type CineSpec = {
  video: string;
  duration: number;
  crop: {x: number; w: number}; // horizontal crop of the 16:9 take, in source px (1920 wide)
  cuts: Cut[];
  captions: Cap[];
  punches?: Punch[];
  label?: string;
};

const sec = (s: number, fps: number) => Math.round(s * fps);

// Kai's talking take, full screen, never restarted.
const KaiTake: React.FC<{spec: CineSpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const punch = spec.punches?.find((p) => t >= p.start && t < p.end);
  // gentle constant drift so a talking shot is never static, plus hard punch-ins on emphasis
  const drift = 1 + 0.02 * Math.sin(frame / 50);
  const z = (punch ? punch.zoom : 1) * drift;
  const scale = 1920 / 1080; // fill height
  const w = 1920 * scale; // rendered width of the 16:9 source
  const left = -(spec.crop.x + spec.crop.w / 2) * scale + 540;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'black'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '50% 38%'}}>
        <OffthreadVideo src={staticFile(spec.video)} style={{position: 'absolute', top: 0, left, width: w, height: 1920}} />
      </div>
    </AbsoluteFill>
  );
};

const CutView: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const len = sec(cut.end - cut.start, fps);
  const s = interpolate(frame, [0, len], [1.08, 1.0]);
  const flash = interpolate(frame, [0, 4], [0.55, 0], {extrapolateRight: 'clamp'});
  const style: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`};
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {cut.kind === 'video' ? (
        <OffthreadVideo src={staticFile(cut.src)} muted style={style} />
      ) : (
        <Img src={staticFile(cut.src)} style={style} />
      )}
      <AbsoluteFill style={{background: 'white', opacity: flash}} />
    </AbsoluteFill>
  );
};

const CaptionView: React.FC<{c: Cap}> = ({c}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = c.text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 1250,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'baseline',
        columnGap: 40,
        rowGap: 0,
      }}
    >
      {words.map((w, i) => {
        const p = spring({frame: frame - i * 2, fps, config: {damping: 18, stiffness: 240}});
        const norm = w.toLowerCase().replace(/[^a-z0-9'#]/g, '');
        const isKey = !!c.key && norm === c.key.toLowerCase();
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              margin: '0 4px',
              fontFamily: INTER,
              fontWeight: 900,
              fontSize: isKey ? 150 : 104,
              lineHeight: 1.02,
              letterSpacing: 0,
              textTransform: 'uppercase',
              color: isKey ? YELLOW : 'white',
              WebkitTextStroke: '5px black',
              paintOrder: 'stroke fill',
              textShadow: '0 8px 0 rgba(0,0,0,0.85), 0 14px 40px rgba(0,0,0,0.6)',
              transform: `scale(${interpolate(p, [0, 1], [0.4, 1])}) rotate(${isKey ? -3 : 0}deg)`,
              opacity: Math.min(1, p * 2),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const KaiCinematic: React.FC<{specFile: string; spec?: CineSpec}> = ({spec}) => {
  const {fps} = useVideoConfig();
  if (!spec) return null;
  const sfx = {whoosh: 'whoosh.wav', boom: 'boom.wav', pop: 'pop.wav'};
  return (
    <AbsoluteFill style={{background: 'black'}}>
      <KaiTake spec={spec} />
      {spec.cuts.map((c, i) => (
        <Sequence key={'cut' + i} from={sec(c.start, fps)} durationInFrames={Math.max(1, sec(c.end, fps) - sec(c.start, fps))}>
          <CutView cut={c} />
          <Audio src={staticFile(sfx[c.sfx ?? 'whoosh'])} volume={0.4} />
        </Sequence>
      ))}
      {/* bottom vignette so captions always read */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.2) 100%)'}} />
      {spec.captions.map((c, i) => (
        <Sequence key={'cap' + i} from={sec(c.start, fps)} durationInFrames={Math.max(1, sec(c.end, fps) - sec(c.start, fps))}>
          <CaptionView c={c} />
        </Sequence>
      ))}
      {/* AI label, every post (brand rule) */}
      <div style={{position: 'absolute', top: 64, right: 56, fontFamily: MONO, fontSize: 24, color: 'black', background: YELLOW, padding: '6px 14px', borderRadius: 8}}>
        {spec.label ?? 'AI-MADE'}
      </div>
    </AbsoluteFill>
  );
};
