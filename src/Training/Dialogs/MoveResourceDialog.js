import React from 'react';
import { useSearch } from '@vidispine/vdt-react';
import { parseMetadataType } from '@vidispine/vdt-js';
import { ItemSearchPicker } from '@vidispine/vdt-materialui';
import { CreateNewFolder as Create, Search } from '@material-ui/icons';
import {
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';

import { moveShape } from '../utils';
import { TRAINING_METADATA_KEY, TRAINING_METADATA_VALUE } from '../../const';

const ItemTableProps = {
  options: [
    { label: 'ID', value: 'itemId' },
    { label: 'Name', value: TRAINING_METADATA_VALUE },
    { label: 'Type', value: 'type' },
  ],
};

const SearchItemProps = {
  itemSearchDocument: {
    filter: [
      {
        name: 'training_material',
        operation: 'AND',
        field: [
          {
            name: TRAINING_METADATA_KEY,
            value: [{ value: true }],
          },
        ],
      },
    ],
  },
  queryParams: {
    field: [TRAINING_METADATA_VALUE, 'itemId'],
    content: 'metadata',
  },
  rowsPerPage: 5,
};

const MoveResourceDialog = ({
  open,
  onClose,
  shapeId,
  itemId: sourceId,
  onSuccess,
  onError = () => null,
}) => {
  const [view, setView] = React.useState('search');
  const [selected, setSelected] = React.useState([]);
  // const onRowClick = ({ id }) => setSelected(selected.includes(id) ? [] : [id]);

  const onRowClick = ({ id, metadata }) => {
    const newSelected = [];
    if (!selected.some(({ id: prevId }) => prevId === id)) {
      const { [TRAINING_METADATA_VALUE]: title } = parseMetadataType(metadata, {
        flat: true,
        arrayOnSingle: false,
      });
      newSelected.push({ title, id });
    }
    setSelected(newSelected);
  };

  const [disabled, target] = React.useMemo(
    () => [selected.length === 0, selected.length ? selected[0] : undefined],
    [selected],
  );

  const handleSubmit = () => moveShape(shapeId, sourceId, target.id).then(onSuccess).catch(onError);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Move resource</DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={view}
          onChange={(e, newValue) => newValue && setView(newValue)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          style={{ marginBottom: '10px' }}
        >
          <Tab value="search" label="Search" icon={<Search />} />
          <Tab disabled value="create" label="Create" icon={<Create />} />
        </Tabs>
        {
          {
            search: (
              <ItemSearchPicker
                ItemTableProps={{
                  onRowClick,
                  selected: selected.map(({ id }) => id),
                  ...ItemTableProps,
                }}
                searchProps={useSearch(SearchItemProps)}
              />
            ),
            // TODO: Add possibility to create new item and move resource there
            create: null,
          }[view]
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={disabled}>
          {target ? `Move to ${target.title}` : 'Move'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveResourceDialog;
