import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, Link } from 'react-router-dom';
import { MediaCardAvatar, MediaBadges, EntityDeleteDialog } from '@vidispine/vdt-materialui';
import { parseMetadataType, roles as ROLES } from '@vidispine/vdt-js';
import { HasRole } from '@vidispine/vdt-react';
import moment from 'moment';
import {
  Grid,
  Card,
  Divider,
  MenuItem,
  IconButton,
  ButtonBase,
  CardHeader,
  Typography,
  CardContent,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import {
  Face as FaceIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  EmojiObjects as EmojiObjectsIcon,
} from '@material-ui/icons';

import { Skeleton } from '@material-ui/lab';

import { MenuVert } from '../Layout';

import ItemAnalyzeDialog from './ItemAnalyzeDialog';
import { useTraining, useDialog, useSnackbar } from '../Context';

function ItemMenu({ mediaType, itemId, onCapture }) {
  const history = useHistory();
  const { setNotification } = useSnackbar();
  const { isConfigured } = useTraining();
  const { showDialog } = useDialog();

  const handleAnalyze = () => showDialog({ Dialog: ItemAnalyzeDialog, itemId }).catch(() => null);
  const handleDelete = () =>
    showDialog({
      Dialog: EntityDeleteDialog,
      entity: 'item',
      entityId: itemId,
      confirmButtonText: 'Permanently delete item',
    })
      .then(() => {
        setNotification({ open: true, message: `${itemId} successfully removed` });
        history.push('/item/');
      })
      .catch(
        ({ message }) => message && setNotification({ open: true, message, severity: 'error' }),
      );

  return (
    <MenuVert>
      <MenuItem onClick={handleAnalyze} disabled={mediaType !== 'video'}>
        <ListItemIcon>
          <EmojiObjectsIcon />
        </ListItemIcon>
        <ListItemText primary="Analyze" />
      </MenuItem>
      <MenuItem onClick={onCapture} disabled={mediaType !== 'video' || !isConfigured}>
        <ListItemIcon>
          <FaceIcon />
        </ListItemIcon>
        <ListItemText primary="Capture face" />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleDelete}>
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary="Delete" primaryTypographyProps={{ color: 'secondary' }} />
      </MenuItem>
    </MenuVert>
  );
}

export default function ItemHeader({ itemType = {}, isLoading, onClose, linkTo, onCapture }) {
  const { t } = useTranslation();
  const { metadata: metadataType, shape: shapeTypeList = [], id: itemId } = itemType;
  const metadata = React.useMemo(
    () => parseMetadataType(metadataType, { joinValue: ',', flat: true }),
    [metadataType],
  );
  const [shapeType] = shapeTypeList;
  const { title, mimeType, created, user, originalFilename, mediaType } = metadata;
  return (
    <Card square elevation={0} style={{ backgroundColor: 'inherit' }}>
      <CardHeader
        title={
          isLoading ? (
            <Skeleton variant="rect" width="50%" height={28} />
          ) : (
            title || originalFilename
          )
        }
        avatar={
          isLoading ? (
            <Skeleton variant="rect" width={40} height={40} />
          ) : (
            <MediaCardAvatar avatar={mimeType} />
          )
        }
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <>
            {linkTo && (
              <IconButton component={Link} to={linkTo} disableRipple>
                <LaunchIcon />
              </IconButton>
            )}
            <HasRole
              roleName={[ROLES.ITEM_WRITE]}
              allow={<ItemMenu onCapture={onCapture} itemId={itemId} mediaType={mediaType} />}
            />
            {onClose && (
              <IconButton component={ButtonBase} onClick={onClose} disableRipple>
                <CloseIcon />
              </IconButton>
            )}
          </>
        }
      />
      <CardContent>
        {isLoading ? (
          <Skeleton variant="rect" width="10%" height={18} />
        ) : (
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              {isLoading ? (
                <Skeleton variant="rect" width="10%" height={18} />
              ) : (
                <Grid container alignItems="center">
                  <Typography variant="body2">
                    {t('createdBy')}
                    &nbsp;
                  </Typography>
                  <Typography variant="subtitle2">{user}</Typography>
                  <Typography variant="body2">&nbsp;on&nbsp;</Typography>
                  <Typography variant="subtitle2">
                    {created ? moment(created).format('ll') : ''}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Grid item>
              {isLoading ? (
                <Skeleton variant="rect" width="10%" height={18} />
              ) : (
                <Grid container alignItems="center">
                  <MediaBadges shapeType={shapeType} />
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
