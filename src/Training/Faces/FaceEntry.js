import React from 'react';
import clsx from 'clsx';
import { withStyles, Box, Grid, Chip, Divider, Tooltip, Typography } from '@material-ui/core';
import { Fingerprint as FingerprintIcon } from '@material-ui/icons';
import { formatTimeCodeText, formatTimeCodeType } from '@vidispine/vdt-js';

import {
  ANALYSIS_MODEL_GROUP as GROUP,
  ANALYSIS_MODEL_ID_FIELD as ID,
  ANALYSIS_MODEL_VALUE_FIELD as VALUE,
  ANALYSIS_MODEL_CONFIDENCE_FIELD as CONFIDENCE,
} from '../../const';

const Face = withStyles((theme) => ({
  root: {
    height: theme.spacing(4),
    borderRadius: theme.spacing(4),
    paddingRight: theme.spacing(1),
    '&:hover': {
      backgroundColor: `${theme.palette.secondary.light}4d !important`,
    },
  },
  avatar: {
    height: `${theme.spacing(3)}px !important`,
    width: `${theme.spacing(3)}px !important`,
  },
  deleteIcon: {
    width: 'auto !important',
  },
  disabled: {
    opacity: '1 !important',
  },
}))(Chip);

const styles = ({ palette }) => ({
  root: {
    cursor: 'pointer',
    transition: 'background-color 0.3s ease-out',
    '&:hover': {
      backgroundColor: palette.type === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)',
    },
  },
  isActive: {
    backgroundColor: palette.type === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor: palette.type === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.4)',
    },
  },
});

const FaceEntry = ({ start, end, metadata, classes, onSeek, isActive, onClick }) => {
  const ref = React.createRef();
  const faces = React.useMemo(() => {
    const { group } = metadata.find(({ name }) => name === GROUP);
    return group.map(({ [VALUE]: value = '', [ID]: id, [CONFIDENCE]: confidence, group: box }) => ({
      unknown: value.includes('unknown_'),
      confidence,
      value,
      id,
      box,
    }));
  }, [metadata]);
  const { startText, endText, durationText } = React.useMemo(() => {
    const startValue = formatTimeCodeText(start);
    const endValue = formatTimeCodeText(end);
    const durationSamples = endValue.samples - startValue.samples;
    const timeCodeType = { samples: durationSamples, timeBase: endValue.timeBase };
    const durationValue = formatTimeCodeType(timeCodeType);
    return {
      startText: startValue,
      endText: endValue,
      durationText: durationValue,
    };
  }, [end, start]);

  React.useEffect(() => {
    if (isActive) {
      if (ref && ref.current) {
        ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
    // eslint-disable-next-line
  }, [isActive]);

  const onChipClick = (event, payload) => {
    event.stopPropagation();
    onClick(payload);
  };
  return (
    <Box key={start}>
      <Box
        minHeight={50}
        p={2}
        ref={ref}
        onClick={() => onSeek(startText.toSeconds())}
        className={clsx(classes.root, { [classes.isActive]: isActive })}
      >
        <Grid container alignItems="flex-start" wrap="nowrap">
          <Grid item>
            <Grid container direction="column">
              <Typography variant="caption">{startText.toSmpte()}</Typography>
              <Typography variant="caption">{endText.toSmpte()}</Typography>
            </Grid>
          </Grid>
          <Grid item style={{ flexGrow: 1 }}>
            <Box px={2}>
              {faces.map(({ id, value, unknown, confidence }) => (
                <Tooltip key={id} title="I know this person, click to edit" placement="top-start">
                  <Face
                    key={id}
                    label={value}
                    variant="outlined"
                    size="small"
                    clickable
                    disabled={!unknown}
                    onClick={(e) => onChipClick(e, id)}
                    onDelete={() => null}
                    avatar={unknown ? <FingerprintIcon /> : null}
                    deleteIcon={<span>{Math.round(confidence * 100)}</span>}
                  />
                </Tooltip>
              ))}
            </Box>
          </Grid>
          <Grid item>
            <Grid container direction="column">
              <Typography variant="caption">{durationText.toDuration()}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Divider />
    </Box>
  );
};

export default withStyles(styles)(FaceEntry);
