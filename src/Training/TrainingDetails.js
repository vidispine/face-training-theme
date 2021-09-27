import React from 'react';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GetItem } from '@vidispine/vdt-react';
import { ItemTabs } from '@vidispine/vdt-materialui';
import { parseMetadataType } from '@vidispine/vdt-js';
import { withStyles, Box, Grid, CardHeader, Avatar, Typography } from '@material-ui/core';

import { TRAINING_METADATA_VALUE } from '../const';
import TrainingResources from './TrainingResources';
import TrainingEvents from './TrainingEvents';

const Header = withStyles({
  content: {
    overflow: 'hidden',
  },
  avatar: {
    '& .MuiAvatar-root': {
      width: 100,
      height: 100,
    },
  },
})(CardHeader);

const TrainingHeader = ({ itemType = {} }) => {
  const { t } = useTranslation();
  const { [TRAINING_METADATA_VALUE]: label, user, created } = React.useMemo(
    () => parseMetadataType(itemType.metadata, { flat: true, arrayOnSingle: false }),
    [itemType],
  );
  return (
    <Header
      title={label}
      style={{ overflow: 'hidden' }}
      titleTypographyProps={{ variant: 'h3', noWrap: true }}
      subheader={
        <Box display="flex" alignItems="center">
          <Typography variant="body1">
            {t('createdBy')}
            &nbsp;
          </Typography>
          <Typography variant="subtitle1">{user}</Typography>
          <Typography variant="body1">&nbsp;on&nbsp;</Typography>
          <Typography variant="subtitle1">{created ? moment(created).format('ll') : ''}</Typography>
        </Box>
      }
      avatar={<Avatar variant="rounded" alt={label} />}
    />
  );
};

const TrainingContent = ({ itemId, ...props }) => {
  const tabs = [
    { label: 'images', component: TrainingResources, cols: 4 },
    { label: 'appearances', component: TrainingEvents },
  ];
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <ItemTabs tabs={tabs} itemId={itemId} {...props} />;
};

export const TrainingDetails = () => {
  const { itemId } = useParams();
  const queryParams = { content: ['metadata'], interval: 'generic' };

  return (
    <Grid container>
      <Grid item xs={12} sm={6}>
        <GetItem itemId={itemId} queryParams={queryParams}>
          <TrainingHeader />
        </GetItem>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TrainingContent itemId={itemId} />
      </Grid>
    </Grid>
  );
};

export default TrainingDetails;
