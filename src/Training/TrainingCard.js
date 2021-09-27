import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from '@vidispine/vdt-react';
import { withDrag, MediaCard } from '@vidispine/vdt-materialui';
import {
  withStyles,
  emphasize,
  Box,
  Divider,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import {
  Delete as DeleteIcon,
  TextFormat as TextIcon,
  Forward as ForwardIcon,
  MergeType as MergeIcon,
  CreateNewFolder as AddIcon,
} from '@material-ui/icons';

import { MenuVert } from '../Layout';

const Card = compose(
  withStyles((theme) => ({
    root: {
      boxShadow: theme.shadows[1],
      transition: 'box-shadow 0.3s ease',
      cursor: 'grab',
      '&:hover': {
        boxShadow: theme.shadows[5],
      },
      '& .card-content': {
        backgroundColor: emphasize(theme.palette.background.paper, 0.1),
      },
      '& .card-thumbnail': {
        cursor: 'grab !important',
      },
    },
    isDragging: {
      opacity: 0.3,
      cursor: 'grabbing',
    },
  })),
  withDrag,
)(MediaCard);

// eslint-disable-next-line react/jsx-props-no-spreading
const FaceCard = (props) => <Card {...props} />;

const CardMenu = ({ itemId, onOpen, onMerge, onDelete, onRename, onAddToCollection }) => (
  <MenuVert onOpen={onOpen} size="small">
    <MenuItem component={Link} to={`/training/${itemId}`}>
      <ListItemIcon>
        <ForwardIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="Go to face" />
    </MenuItem>
    <MenuItem onClick={onRename}>
      <ListItemIcon>
        <TextIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="Change name" />
    </MenuItem>
    <MenuItem onClick={onAddToCollection}>
      <ListItemIcon>
        <AddIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="Move to collection" />
    </MenuItem>
    <MenuItem onClick={onMerge}>
      <ListItemIcon>
        <MergeIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="Map to existing face" />
    </MenuItem>
    <Divider />
    <MenuItem onClick={onDelete}>
      <ListItemIcon>
        <DeleteIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primaryTypographyProps={{ color: 'error' }} primary="Delete face" />
    </MenuItem>
  </MenuVert>
);

const Content = ({
  title,
  itemId,
  method,
  // subheader,
  interactive,
  onOpen,
  onMerge,
  onDelete,
  onRename,
  onAddToCollection,
}) => {
  // const { request, data = {}, isLoading } = useApi(ItemApi.getItem);
  // React.useEffect(() => {
  //   if (!itemId) return;
  //   const queryParams = { content: 'shape', p: 'shape.metadata.field[key=vcs_face_method]' };
  //   request({ itemId, queryParams });
  // }, [itemId, request]);
  // const isActive = React.useMemo(() => {
  //   const { shape = [] } = data;
  //   if (!shape.length) return false;
  //   return shape.some(({ metadata = {} }) => {
  //     const { field = [] } = metadata;
  //     const { value } = field.find(({ key }) => key === 'vcs_face_method') || {};
  //     return value === 'TRAINED';
  //   });
  // }, [data]);
  const isAutotrained = method === 'INDEXED';
  const isUsertrained = method === 'TRAINED';
  return (
    <Box className="card-content" display="flex" flexDirection="row" p={1} alignItems="center">
      <Box flexGrow={1} display="flex" flexDirection="column" overflow="hidden">
        <Typography noWrap style={{ flexGrow: 1 }} variant="subtitle1">
          {title && title}
        </Typography>
        {isAutotrained && (
          <Box color="info.dark">
            <Typography color="inherit" variant="button">
              system trained
            </Typography>
          </Box>
        )}
        {isUsertrained && (
          <Box color="success.dark">
            <Typography variant="button">user trained</Typography>
          </Box>
        )}
        {!isUsertrained && !isAutotrained && (
          <Box color="warning.dark">
            <Typography variant="button">not trained</Typography>
          </Box>
        )}
        {/* <Typography variant="caption">
          {subheader && moment(subheader).format('YYYY-MM-DD HH:mm')}
        </Typography> */}
        {/* {isActive && (
          <Box display="flex" alignItems="center" flexGrow={1} color="#4caf50">
            <ActiveIcon fontSize="small" />
            <Typography style={{ marginLeft: 8 }} variant="button">
              Trained
            </Typography>
          </Box>
        )}
        {!isActive && (
          <Box display="flex" alignItems="center" flexGrow={1} color="#f44336">
            <Tooltip title="Open this item for further details">
              <ErrorIcon fontSize="small" />
            </Tooltip>
            <Typography style={{ marginLeft: 8 }} variant="button">
              Action needed
            </Typography>
          </Box>
        )} */}
      </Box>
      <Box flexShrink={0} flexBasis={1}>
        {interactive && (
          <CardMenu
            itemId={itemId}
            onOpen={onOpen}
            onMerge={onMerge}
            onDelete={onDelete}
            onRename={onRename}
            onAddToCollection={onAddToCollection}
          />
        )}
      </Box>
    </Box>
  );
};

const TrainingCard = ({
  title,
  subheader,
  content: parentId,
  avatar: method,
  itemId,
  onOpen,
  onClick,
  onMerge,
  onDelete,
  onRename,
  onAddToCollection,
  interactive = true,
  ...rest
}) => (
  <FaceCard
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}
    CardProps={{
      style: { width: 200 },
      onClick: () => onClick({ itemId, title, parentId, method: subheader }),
    }}
    ThumbnailProps={{ className: 'card-thumbnail' }}
    HeaderComponent={null}
    ActionsComponent={null}
    ContentComponent={Content}
    ContentProps={{
      title,
      itemId,
      method,
      subheader,
      interactive,
      onOpen: () => onOpen({ itemId, parentId, title, method }),
      onMerge,
      onDelete,
      onRename,
      onAddToCollection,
    }}
    parentId={parentId}
    hideDefaultDraggedComponent={false}
  />
);

export default TrainingCard;
