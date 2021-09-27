import React from 'react';
import { GetItem } from '@vidispine/vdt-react';
import { parseShapeType, parseKeyValuePairType } from '@vidispine/vdt-js';
import { MediaCardThumbnail } from '@vidispine/vdt-materialui';
import {
  withStyles,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
  GridList,
  GridListTile,
  GridListTileBar as MuiGridListTileBar,
} from '@material-ui/core';
import {
  Delete as DeleteIcon,
  Forward as MoveIcon,
  Add as AddIcon,
  Face as ThumbnailIcon,
} from '@material-ui/icons';

import { useDialog, useSnackbar } from '../Context';
import { MoveResourceDialog, UploadToItemDialog } from './Dialogs';
import { MenuVert } from '../Layout';
import { deleteShape } from './utils';

const extendedParseShapeType = (shapeType) => {
  if (!shapeType) return {};
  const shape = {};
  const { id: shapeId, metadata, ...rest } = shapeType;

  const { containerComponent: { file: fileList = [] } = {} } = rest;
  if (fileList.length) {
    const [{ id: fileId, storage: storageId }] = fileList;
    if (fileId) shape.fileId = fileId;
    if (storageId) shape.storageId = storageId;
  }
  if (metadata) {
    const { field = [] } = metadata;
    if (field.length) shape.metadata = parseKeyValuePairType(field);
  }
  return { ...parseShapeType(rest, { flat: true }), ...shape, shapeId };
};

const queryParams = {
  content: 'shape',
  methodMetadata: [
    { key: 'format', value: 'SIGNED-AUTO' },
    { key: 'contentDisposition', value: 'attachment' },
  ],
  'noauth-url': true,
};

const ShapeMenu = ({ onOpen, onClose, onMove, onDelete, onThumbnail }) => (
  <MenuVert size="small" onOpen={onOpen} onClose={onClose} style={{ color: '#fff' }}>
    <MenuItem onClick={onMove}>
      <ListItemIcon>
        <MoveIcon />
      </ListItemIcon>
      <ListItemText primary="Move resource" />
    </MenuItem>
    <MenuItem onClick={onThumbnail}>
      <ListItemIcon>
        <ThumbnailIcon />
      </ListItemIcon>
      <ListItemText primary="Use as thumbnail" />
    </MenuItem>
    <MenuItem onClick={onDelete}>
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <ListItemText primary="Delete resource" />
    </MenuItem>
  </MenuVert>
);

const GridListTitleBar = withStyles((theme) => ({
  root: {
    zIndex: 10,
    padding: theme.spacing(1),
    height: 'auto',
  },
  titleWrap: {
    margin: 0,
  },
}))(MuiGridListTileBar);

const TrainingResourceCard = ({ resource, onMove, onDelete }) => {
  const { uri, shapeId, metadata } = resource;
  const title = React.useMemo(() => {
    if (!metadata) return 'NOT TRAINED';
    const { vcs_face_method: state } = metadata;
    if (state === 'INDEXED') return 'SYSTEM TRAINED';
    if (state === 'TRAINED') return 'USER TRAINED';
    return 'NOT TRAINED';
  }, [metadata]);

  const handleMove = () => onMove(shapeId);
  const handleDelete = () => onDelete(shapeId);
  return (
    <>
      <MediaCardThumbnail image={uri} height={200} />
      <GridListTitleBar
        title={title}
        actionIcon={<ShapeMenu shapeId={shapeId} onMove={handleMove} onDelete={handleDelete} />}
      />
    </>
  );
};

const UploadTile = withStyles(({ palette }) => ({
  tile: {
    backgroundColor: palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all .2s',
    '&:hover': {
      backgroundColor: palette.primary.main,
    },
  },
}))(GridListTile);

const TrainingResourceList = ({ itemType, onRefresh, cols = 2 }) => {
  const { showDialog } = useDialog();
  const { setNotification } = useSnackbar();

  const success = () => setNotification({ open: true, message: 'Success!' });
  const failed = ({ message }) =>
    message && setNotification({ open: true, message, severity: 'error' });

  const { shape = [], id: itemId } = itemType;
  const shapes = React.useMemo(() => shape.map((s) => ({ ...extendedParseShapeType(s), itemId })), [
    shape,
    itemId,
  ]);

  const onDelete = (shapeId) =>
    showDialog({
      title: 'Delete resource',
      message: 'Are you sure you want to delete this resource?',
      okText: 'Yes, delete',
      noText: 'No, cancel',
    })
      .then(() => deleteShape(itemId, shapeId).then(success).catch(failed))
      .catch(failed)
      .then(onRefresh);
  const onMove = (shapeId) =>
    showDialog({
      Dialog: MoveResourceDialog,
      itemId,
      shapeId,
    })
      .then(success)
      .catch(failed)
      .then(onRefresh);
  const onUpload = () =>
    showDialog({ Dialog: UploadToItemDialog, itemId })
      .then(() => setNotification({ open: true, message: 'Import job started' }))
      .catch(failed);
  return (
    <GridList cellHeight={200} cols={cols} spacing={8}>
      {shapes.map((resource) => (
        <GridListTile key={resource.shapeId} cols={1}>
          <TrainingResourceCard resource={resource} onMove={onMove} onDelete={onDelete} />
        </GridListTile>
      ))}
      <UploadTile onClick={onUpload} cols={1}>
        <AddIcon size="large" />
        <Typography variant="button">Add new resource</Typography>
      </UploadTile>
    </GridList>
  );
};

const TrainingResources = ({ itemId, cols = 2 }) => {
  if (!itemId) return null;
  return (
    <GetItem itemId={itemId} queryParams={queryParams}>
      <TrainingResourceList cols={cols} />
    </GetItem>
  );
};

export default TrainingResources;
