import React from 'react';
import {Composition, staticFile} from 'remotion';
import {KaiReel, ReelSpec} from './KaiReel';

// Each reel is one JSON spec in public/<id>.json (words, beats, captions).
// Duration comes from the spec so a re-timed take needs no code change.
export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="KaiReel"
        component={KaiReel}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={30 * 30}
        defaultProps={{specFile: 'kai01.json'} as {specFile: string; spec?: ReelSpec}}
        calculateMetadata={async ({props}) => {
          const res = await fetch(staticFile(props.specFile));
          const spec: ReelSpec = await res.json();
          return {
            durationInFrames: Math.ceil(spec.duration * 30),
            props: {...props, spec},
          };
        }}
      />
    </>
  );
};
