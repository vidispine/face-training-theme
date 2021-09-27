import React from 'react';

import { Box, Checkbox as MuiCheckbox, Typography, withStyles } from '@material-ui/core';
import { MediaCard } from '@vidispine/vdt-materialui';

const Checkbox = ({ checked }) => <MuiCheckbox checked={checked} />;

const Card = withStyles(({ shadows, palette, spacing }) => ({
  root: {
    marginBottom: spacing(2),
    cursor: 'pointer',
    boxShadow: shadows[1],
    transition: 'all 0.3s ease',
    '& .MuiCardHeader-root': {
      paddingRight: spacing(1),
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
        color: palette.secondary.main,
      },
    },
    '&:not(:last-child)': {
      marginRight: spacing(2),
    },
  },
}))(({ onClick, ...props }) => (
  <MediaCard
    ThumbnailComponent={null}
    ContentComponent={null}
    ActionsComponent={null}
    MenuComponent={null}
    AvatarComponent={Checkbox}
    CardProps={{ onClick }}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

const filterName = 'status_filter';
const fieldName = 'vcs_face_method';

const UserFilter = {
  name: 'status_filter',
  operation: 'AND',
  field: [{ name: fieldName, value: [{ value: 'TRAINED' }] }],
};
const AutoFilter = {
  name: 'status_filter',
  operation: 'AND',
  field: [{ name: fieldName, value: [{ value: 'INDEXED' }] }],
};
const NoneFilter = {
  name: 'status_filter',
  operation: 'NOT',
  field: [{ name: fieldName, value: [{ value: '*' }] }],
};

export const TrainingFilter = ({ filter: itemSearchDocument = {}, setFilter }) => {
  const [auto, user, none] = React.useMemo(() => {
    const { filter: filterList = [] } = itemSearchDocument;
    const { operation, field = [{}] } = filterList.find(({ name }) => name === filterName) || {};
    if (operation === 'NOT') return [false, false, true];
    const [{ value: [{ value }] = [{}] }] = field;
    if (value === 'TRAINED') return [false, true, false];
    if (value === 'INDEXED') return [true, false, false];
    return [false, false, false];
  }, [itemSearchDocument]);
  const onUser = () => {
    const { filter: filterList = [] } = itemSearchDocument;
    const filteredFilter = filterList.filter(({ name }) => name !== filterName);
    if (user) {
      setFilter({ ...itemSearchDocument, filter: filteredFilter });
    } else {
      setFilter({ ...itemSearchDocument, filter: [...filteredFilter, UserFilter] });
    }
  };
  const onAuto = () => {
    const { filter: filterList = [] } = itemSearchDocument;
    const filteredFilter = filterList.filter(({ name }) => name !== filterName);
    if (auto) {
      setFilter({ ...itemSearchDocument, filter: filteredFilter });
    } else {
      setFilter({ ...itemSearchDocument, filter: [...filteredFilter, AutoFilter] });
    }
  };
  const onNone = () => {
    const { filter: filterList = [] } = itemSearchDocument;
    const filteredFilter = filterList.filter(({ name }) => name !== filterName);
    if (none) {
      setFilter({ ...itemSearchDocument, filter: filteredFilter });
    } else {
      setFilter({ ...itemSearchDocument, filter: [...filteredFilter, NoneFilter] });
    }
  };
  return (
    <Box display="flex" flexDirection="column">
      <Typography paragraph gutterBottom variant="h6">
        Filter by state
      </Typography>
      <Box display="flex" flexWrap="wrap">
        <Card
          checked={user}
          onClick={onUser}
          title="User trained"
          subheader="Display only faces trained manually"
        />
        <Card
          checked={auto}
          onClick={onAuto}
          title="System trained"
          subheader="Display only faces trained by the system"
        />
        <Card
          checked={none}
          onClick={onNone}
          title="Not trained"
          subheader="Display only faces not trained"
        />
      </Box>
    </Box>
  );
};

export default TrainingFilter;
