import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import moment from 'moment';
import { ItemGrid, MediaCardThumbnail } from '@vidispine/vdt-materialui';

import ItemLink from '../Item/ItemLink';
import MediaCardHeaderDraggable from './MediaCardHeaderDraggable';
import { PREFIX_STRING, SUFFIX_STRING } from '../const';

const subheaderSelector = ({ created }) => (created ? moment(created).format('ll') : '');

const titleSelector = ({ originalFilename, title, itemId }, { title: highlightedTitle }) => {
  if (typeof highlightedTitle === 'string') {
    const startIndex = highlightedTitle.indexOf(PREFIX_STRING);
    const endIndex = highlightedTitle.indexOf(SUFFIX_STRING);
    const startString = highlightedTitle.slice(0, startIndex);
    const endString = highlightedTitle.slice(endIndex).replace(SUFFIX_STRING, '');
    const keyword = highlightedTitle.slice(startIndex, endIndex).replace(PREFIX_STRING, '');
    const endStringArray = endString.split(PREFIX_STRING).reduce((a, c) => {
      if (c.includes(SUFFIX_STRING)) {
        const [thisKeyword, remaining] = c.split(SUFFIX_STRING);
        const reducedAcc = [...a, <strong key={thisKeyword}>{thisKeyword}</strong>];
        if (remaining) reducedAcc.push(<em key={remaining}>{remaining}</em>);
        return reducedAcc;
      }
      if (c) return [...a, c];
      return a;
    }, []);
    if (keyword)
      return (
        <>
          {startString}
          <strong>{keyword}</strong>
          {endStringArray}
        </>
      );
  }
  if (title) return title;
  if (originalFilename) return originalFilename;
  return itemId;
};

const ThumbnailComponent = ItemLink(MediaCardThumbnail);

export default function CustomItemGrid(props) {
  const matches = useMediaQuery((theme) => theme.breakpoints.up('sm'));
  return (
    <>
      <ItemGrid
        ItemCardProps={{
          titleSelector,
          subheaderSelector,
          ThumbnailComponent,
          HeaderComponent: MediaCardHeaderDraggable,
          MenuComponent: null,
          ContentComponent: null,
          ActionsComponent: null,
          titleTypographyProps: { noWrap: true, style: { width: 220 } },
          subheaderTypographyProps: { noWrap: true, style: { width: 220 } },
        }}
        GridContainerProps={{ justifyContent: matches ? 'flex-start' : 'space-evenly' }}
        GridItemProps={{ style: { paddingRight: 8, paddingBottom: 8 } }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    </>
  );
}
