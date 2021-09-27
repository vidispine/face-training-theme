import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { GetItem } from '@vidispine/vdt-react';
import { ItemPlayer, ItemTabs, ItemShapeTab, EntityComment } from '@vidispine/vdt-materialui';

import ItemHeader from './ItemHeader';
import ItemFacesTab from '../Training/Faces/FaceTab';
import CaptureDialog from '../Training/Dialogs/CaptureDialog';
import { useSnackbar, useDialog, useTraining } from '../Context';
import GrabFaceButton from './GrabFaceButton';

const headerQueryParams = {
  content: ['metadata', 'shape'],
  tag: 'original',
  field: ['title', 'mimeType', 'mediaType', 'created', 'user', 'originalFilename'],
  interval: 'generic',
};

const playerQueryParams = {
  content: ['thumbnail', 'metadata', 'shape'],
  methodMetadata: [{ key: 'format', value: 'SIGNED-AUTO' }],
  'noauth-url': true,
  group: 'stl_subtitle',
  field: 'stl_text',
  sampleRate: 'PAL',
};

export default function Item({
  itemId: propsItemId,
  startSeconds: propsStartSeconds,
  endSeconds: propsEndSeconds,
  EntityCommentComponent = EntityComment,
  isCinema: initialIsCinema = false,
  ItemHeaderProps = {},
  onVideoEnd,
}) {
  const { t } = useTranslation();
  const { itemId: paramsItemId } = useParams();
  const { showDialog } = useDialog();
  const { setNotification } = useSnackbar();
  const { isConfigured, isLoading } = useTraining();
  const itemId = propsItemId || paramsItemId;
  const queryParams = new URLSearchParams(useLocation().search);
  const startSeconds = Number(queryParams.get('t') || propsStartSeconds);
  const endSeconds = propsEndSeconds;
  const startSecondsRef = React.useRef(startSeconds);
  const videoEl = React.createRef();
  React.useEffect(() => {
    if (startSecondsRef.current && videoEl.current) {
      if (startSecondsRef.current !== startSeconds) {
        startSecondsRef.current = startSeconds;
        videoEl.current.player.videoEl.currentTime = startSeconds;
      }
    }
  }, [startSeconds, videoEl]);
  const [isCinema, setIsCinema] = React.useState(initialIsCinema);
  const onCinema = (newIsCinema) => setIsCinema(newIsCinema);

  const tabs = [
    {
      label: t('Faces'),
      component: ItemFacesTab,
    },
    {
      label: t('formats'),
      component: ItemShapeTab,
      hideOnMount: true,
    },
  ];
  const screenshotRef = React.useRef(false);
  const onCapture = () =>
    showDialog({ Dialog: CaptureDialog, videoEl: videoEl.current })
      .then(() => setNotification({ open: true, message: 'Import job started' }))
      .catch(
        ({ message }) => message && setNotification({ open: true, message, severity: 'error' }),
      );

  if (isLoading) return null;

  return (
    <>
      <Box>
        <GrabFaceButton screenshotRef={screenshotRef} onClick={onCapture} />
        <Grid container justifyContent="space-between">
          <Grid
            item
            style={{
              width: isCinema ? '100%' : '50%',
              marginLeft: isCinema ? 8 : 0,
              marginRight: isCinema ? 8 : 0,
              transition: 'width 0.5s, margin 0.5s',
            }}
          >
            <GetItem itemId={itemId} queryParams={headerQueryParams}>
              <ItemHeader
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...ItemHeaderProps}
                onCapture={onCapture}
              />
            </GetItem>
            <GetItem itemId={itemId} queryParams={playerQueryParams}>
              <ItemPlayer
                itemId={itemId}
                videoEl={videoEl}
                subtitleGroup={playerQueryParams.group}
                subtitleField={playerQueryParams.field}
                onCinema={onCinema}
                onScreenshot={onCapture}
                ItemVideoPlayerProps={{
                  onScreenshotSuccess: () =>
                    setNotification({ open: true, message: 'Screenshot Job Started' }),
                  onScreenshotError: () =>
                    setNotification({
                      open: true,
                      message: 'Error Starting Screenshot Job',
                      severity: 'error',
                    }),
                }}
                videoPlayerProps={{
                  ...(isConfigured && { crossOrigin: 'anonymous' }),
                  controlsBelowPlayer: true,
                  onReady: (videojs) => {
                    if (!Number.isNaN(startSeconds)) {
                      videojs.currentTime(startSeconds);
                      videojs.poster('');
                    }
                    screenshotRef.current = true;
                    // setTimeout(() => {
                    //   videojs.play();
                    // }, 500);
                    if (onVideoEnd) videojs.on('ended', onVideoEnd);
                    if (onVideoEnd && endSeconds !== undefined && endSeconds !== 0) {
                      videojs.on('timeupdate', () => {
                        if (videojs.currentTime() >= endSeconds) {
                          videojs.pause();
                          onVideoEnd();
                        }
                      });
                    }
                  },
                }}
                audioPlayerProps={{
                  onReady: (videojs) => {
                    setTimeout(() => {
                      videojs.play();
                    }, 500);
                    if (onVideoEnd) videojs.on('ended', onVideoEnd);
                  },
                }}
              />
            </GetItem>
            {EntityCommentComponent && (
              <EntityCommentComponent entityId={itemId} entity="item" playerRef={videoEl} />
            )}
          </Grid>
          <Grid xs={12} lg={isCinema ? 12 : 6} item>
            <ItemTabs
              tabs={tabs}
              itemId={itemId}
              videoEl={videoEl}
              onError={(error) =>
                setNotification({
                  open: true,
                  message: error.message,
                  severity: 'error',
                })
              }
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
