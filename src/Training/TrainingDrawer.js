import React from 'react';

import { withDrop, ItemTabs } from '@vidispine/vdt-materialui';
import { item as ItemApi } from '@vidispine/vdt-api';
import { compose, useApi } from '@vidispine/vdt-react';
import {
  Drawer,
  Box,
  IconButton,
  Toolbar,
  Card,
  CardHeader,
  Typography,
  CircularProgress,
  withStyles,
} from '@material-ui/core';
import { Close as CloseIcon, Error as ErrorIcon } from '@material-ui/icons';

import TrainingResources from './TrainingResources';
import TrainingEvents from './TrainingEvents';

const FaceDrawer = compose(
  withStyles((theme) => ({
    root: {
      flexShrink: 0,
      '&.open': {
        width: 400,
      },
      '& > *': {
        transition: 'all 0.3s ease',
      },
    },
    paper: {
      zIndex: theme.zIndex.appBar - 1,
      flexShrink: 0,
      width: 400,
      overflow: 'auto',
    },
    canDrop: {
      '& > *': {
        border: `1px solid ${theme.palette.primary.main}`,
      },
    },
    isOver: {
      '& > *': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  })),
  withDrop,
)(Drawer);

const Content = ({ itemId, ...props }) => {
  const tabs = [
    { label: 'images', component: TrainingResources },
    { label: 'appearances', component: TrainingEvents },
  ];
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <ItemTabs tabs={tabs} itemId={itemId} {...props} />;
};

const TrainingDrawer = ({ open, onDrop, onClose, item = {} }) => {
  const { itemId, title, parentId } = item;
  const { request, data = {}, isLoading } = useApi(ItemApi.getItem);
  React.useEffect(() => {
    if (!itemId) return;
    const queryParams = { content: 'shape', p: 'shape.metadata.field[key=vcs_face_method]' };
    request({ itemId, queryParams });
  }, [itemId, request]);
  const { needsTraining } = React.useMemo(() => {
    const { shape = [] } = data;
    if (!shape.length) return false;
    return shape.reduce(
      (acc, { metadata = {} }) => {
        const { field = [] } = metadata;
        const { value } = field.find(({ key }) => key === 'vcs_face_method') || {};
        if (value !== 'TRAINED' && value !== 'INDEXED') return { ...acc, needsTraining: true };
        // if (value === 'TRAINED') return { ...acc, isTrained: true, isValid: true };
        // if (value !== 'INDEXED') return { ...acc, isValid: true };
        return acc;
      },
      { needsTraining: false },
    );
  }, [data]);
  return (
    <FaceDrawer
      className={open ? 'open' : undefined}
      open={open}
      onClose={() => onClose(undefined)}
      anchor="right"
      variant="persistent"
      onDrop={onDrop}
    >
      <Toolbar />
      <Box p={1}>
        <Card elevation={0} style={{ backgroundColor: 'inherit' }}>
          <CardHeader
            title={title}
            subheader={
              <>
                {isLoading && <CircularProgress />}
                {!isLoading && needsTraining && (
                  <Box mt={1} display="flex" alignItems="flex-start" flexGrow={1} color="#f44336">
                    <ErrorIcon />
                    <Typography style={{ marginLeft: 8 }} variant="body2">
                      This resource needs to be trained.
                    </Typography>
                  </Box>
                )}
              </>
            }
            titleTypographyProps={{ variant: 'h4' }}
            action={
              <IconButton onClick={() => onClose(undefined)}>
                <CloseIcon />
              </IconButton>
            }
          />
        </Card>
        {itemId && <Content itemId={itemId} parentId={parentId} />}
      </Box>
    </FaceDrawer>
  );
};

export default TrainingDrawer;
