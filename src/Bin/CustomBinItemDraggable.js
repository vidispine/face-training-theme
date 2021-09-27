/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { withStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';

import { EntityCard, withDrag, MediaCardAvatar } from '@vidispine/vdt-materialui';
import { compose } from '@vidispine/vdt-react';
import { findNearestThumbnail, formatTimeCodeText } from '@vidispine/vdt-js';

const MimeTypeComponent = ({ thumbnail }) => (
  <img
    style={{
      maxWidth: '60px',
      maxHeight: '40px',
      position: 'absolute',
      top: 0,
      bottom: 0,
      margin: 'auto',
    }}
    alt="Thumbnail"
    src={thumbnail}
  />
);

const CustomAvatarComponent = ({
  avatar: mimeType,
  innerProps: { itemId, collectionId, itemType = {}, entityTimespan: { start = 0 } = {} },
}) => {
  const startTime = formatTimeCodeText(start);
  const thumbnail = findNearestThumbnail(itemType, start);
  return (
    <div>
      <Link
        to={
          collectionId
            ? `/collection/${collectionId}`
            : `/item/${itemId}${start ? `?t=${startTime.toSeconds()}` : ''}`
        }
      >
        <MediaCardAvatar
          MimeTypeProps={{ mimeType: collectionId ? 'collection' : mimeType, thumbnail }}
          MimeTypeComponent={thumbnail ? MimeTypeComponent : undefined}
        />
      </Link>
    </div>
  );
};

const styles = {};
export const CustomBinItem = withStyles(styles, { name: 'CustomBinItem' })((props) => {
  const { entityTimespan } = props;
  const subheaderSelector = React.useCallback(() => {
    return entityTimespan
      ? `${formatTimeCodeText(entityTimespan.start).toSmpte()} - ${formatTimeCodeText(
          entityTimespan.end,
        ).toSmpte()}`
      : undefined;
  }, [entityTimespan]);
  const titleSelector = React.useCallback(({ originalFilename, title, itemId, collectionId }) => {
    if (title) return title;
    if (originalFilename) return originalFilename;
    return title || originalFilename || itemId || collectionId;
  }, []);
  return (
    <EntityCard
      titleSelector={titleSelector}
      subheaderSelector={subheaderSelector}
      AvatarComponent={CustomAvatarComponent}
      imageSelector={() => undefined}
      ThumbnailComponent={null}
      ContentComponent={null}
      ActionsComponent={null}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
});

const draggableStyles = {
  isDragging: {
    opacity: 0,
  },
};
const CustomBinItemDraggable = compose(
  withStyles(draggableStyles, { name: 'CustomBinItemDraggable' }),
  withDrag,
)(CustomBinItem);

export default CustomBinItemDraggable;
