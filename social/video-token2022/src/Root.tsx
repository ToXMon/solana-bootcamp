import React from "react";
import { Composition } from "remotion";
import { Token2022Video } from "./Token2022Video";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="token-2022-video"
        component={Token2022Video}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
