import React from 'react';
import { GetItem } from '@vidispine/vdt-react';
import FaceTable from './FaceTable';

import {
  ANALYSIS_MODEL_GROUP as GROUP,
  ANALYSIS_MODEL_SUBGROUP as SUBGROUP,
  ANALYSIS_MODEL_ID_FIELD as ID,
  ANALYSIS_MODEL_VALUE_FIELD as VALUE,
  ANALYSIS_MODEL_CONFIDENCE_FIELD as CONFIDENCE,
} from '../../const';

export default function ItemFacesTab({ itemId, videoEl, sampleRate = 'PAL' }) {
  const queryParams = {
    content: ['metadata'],
    group: [GROUP, SUBGROUP],
    field: [ID, VALUE, CONFIDENCE],
    sampleRate,
    'noauth-url': true,
  };

  const [video, setVideo] = React.useState(null);
  const getVideo = () => {
    if (videoEl.current && !video) setVideo(videoEl.current.player.videoEl);
    else if (video === null) setTimeout(getVideo, 1000);
  };
  React.useEffect(getVideo, [getVideo]);
  return (
    <GetItem itemId={itemId} queryParams={queryParams}>
      <FaceTable video={video} sampleRate={sampleRate} />
    </GetItem>
  );
}
