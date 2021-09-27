import React from 'react';
import { ItemRow, ItemTable, MimeTypeIcon, withDrag } from '@vidispine/vdt-materialui';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';

import { useTranslation } from 'react-i18next';

const formatDurationSeconds = (durationSeconds) => {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = Math.floor(durationSeconds % 60);
  const timeArray = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ];
  return timeArray.join(':');
};

const CreatedComponent = ({ value }) => (value ? moment(value).format('ll') : '');

const DurationComponent = ({ value }) => (value ? formatDurationSeconds(value) : '');

const ThumbnailComponent = ({ innerProps = {} }) => {
  const { itemType = {}, itemId } = innerProps;
  const { thumbnails = {} } = itemType;
  const { uri: srcList = [] } = thumbnails;
  const imgIdx = Math.floor(srcList.length / 2);
  const imgUrl = srcList[imgIdx];
  return (
    <Link to={`/item/${itemId}`}>
      {imgUrl ? (
        <img src={imgUrl} width={80} alt="" />
      ) : (
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.1)',
            width: 80,
            height: 45,
          }}
        />
      )}
    </Link>
  );
};

const MimeTypeComponent = ({ value: mimeType }) => (
  <Avatar variant="square">
    <MimeTypeIcon mimeType={mimeType} />
  </Avatar>
);

const CustomItemRowDraggable = withDrag(ItemRow);

export default function CustomItemTable({ itemListType }) {
  const { t } = useTranslation();

  return (
    <ItemTable
      itemListType={itemListType}
      RowComponent={CustomItemRowDraggable}
      wrapDragInDiv={false}
      options={[
        {
          label: '',
          value: 'mimeType',
          valueComponent: MimeTypeComponent,
        },
        {
          label: '',
          valueComponent: ThumbnailComponent,
        },
        {
          label: t('title'),
          value: 'title',
        },
        {
          label: t('created'),
          value: 'created',
          valueComponent: CreatedComponent,
          hide: 'xs',
        },
        {
          label: t('durationSeconds'),
          value: 'durationSeconds',
          valueComponent: DurationComponent,
          hide: 'xs',
        },
      ]}
    />
  );
}
