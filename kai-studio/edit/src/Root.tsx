import React from 'react';
import {Composition, staticFile} from 'remotion';
import {KaiReel, ReelSpec} from './KaiReel';
import {KaiCinematic, CineSpec} from './KaiCinematic';

// Each reel is one JSON spec in public/<id>.json. Duration comes from the spec.
const meta =
  <T extends {duration: number}>() =>
  async ({props}: {props: {specFile: string}}) => {
    const res = await fetch(staticFile(props.specFile));
    const spec: T = await res.json();
    return {durationInFrames: Math.ceil(spec.duration * 30), props: {...props, spec}};
  };

export const Root: React.FC = () => {
  return (
    <>
      {/* Main format: cinematic + bold */}
      <Composition
        id="KaiCinematic"
        component={KaiCinematic}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={900}
        defaultProps={{specFile: 'kai01c.json'} as {specFile: string; spec?: CineSpec}}
        calculateMetadata={meta<CineSpec>()}
      />
      {/* Older split-screen format (kept for reference) */}
      <Composition
        id="KaiReel"
        component={KaiReel}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={900}
        defaultProps={{specFile: 'kai01.json'} as {specFile: string; spec?: ReelSpec}}
        calculateMetadata={meta<ReelSpec>()}
      />
    </>
  );
};
