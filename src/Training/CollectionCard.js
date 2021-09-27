import React from 'react';

import { Checkbox as MuiCheckbox, withStyles } from '@material-ui/core';
import { compose } from '@vidispine/vdt-react';
import { withDrop, CollectionCard as VdtCollectionCard } from '@vidispine/vdt-materialui';

const Checkbox = ({ innerProps: { collectionId }, checked }) => (
  <MuiCheckbox value={collectionId} checked={checked} />
);

const Card = compose(
  withStyles((theme) => ({
    root: {
      flexGrow: 1,
      maxWidth: 'unset',
      cursor: 'pointer',
      boxShadow: theme.shadows[1],
      transition: 'all 0.3s ease',
      '& .MuiCardHeader-root': {
        paddingRight: 8,
        transition: 'all 0.3s ease',
      },
      '& .MuiCardHeader-action': {
        alignSelf: 'unset',
      },
      '& .MuiIconButton-root': {
        transition: 'all 0.3s ease',
      },
      '&:hover': {
        '& .MuiIconButton-root': {
          color: theme.palette.secondary.main,
        },
      },
    },
    canDrop: {
      borderColor: theme.palette.primary.main,
    },
    isOver: {
      '& .MuiCardHeader-root': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  })),
  withDrop,
)(VdtCollectionCard);

const CollectionCard = ({ onClick: handleClick, onDrop, checked, collectionType }) => {
  const { id } = collectionType;
  const onClick = () => handleClick(id);
  return (
    <Card
      CardProps={{ onClick }}
      onDrop={onDrop}
      collectionType={collectionType}
      collectionId={collectionType.id}
      AvatarComponent={Checkbox}
      checked={checked}
      subheaderSelector={({ items }) => `${items} ${Number(items) === 1 ? 'face' : 'faces'}`}
      titleTypographyProps={{}}
      subheaderTypographyProps={{}}
    />
  );
};

export default CollectionCard;
