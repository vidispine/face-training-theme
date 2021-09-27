import React from 'react';

import { useHistory } from 'react-router-dom';
import { BinList, DragAndDropContext } from '@vidispine/vdt-materialui';
import { BinContext } from '@vidispine/vdt-react';
import { useSnackbar } from '../Context';
import CustomBinItemDraggable, { CustomBinItem } from './CustomBinItemDraggable';

export default function CustomBinList() {
  const {
    bin,
    allowDuplicates,
    setBin,
    setAllowDuplicates,
    onDrop,
    onSort,
    onDelete,
    onEmptyBin,
  } = React.useContext(BinContext);
  const { setNotification } = useSnackbar();
  const history = useHistory();

  const { DraggedComponent, setDraggedComponent } = React.useContext(DragAndDropContext);
  React.useEffect(() => {
    if (!DraggedComponent) setDraggedComponent(CustomBinItem);
    return () => {
      if (DraggedComponent) setDraggedComponent(null);
    };
  }, [DraggedComponent, setDraggedComponent]);

  return (
    <BinList
      bin={bin}
      allowDuplicates={allowDuplicates}
      setBin={setBin}
      onDrop={onDrop}
      onSort={onSort}
      onDelete={onDelete}
      onEmptyBin={onEmptyBin}
      onAllowDuplicates={setAllowDuplicates}
      onAddToCollectionSuccess={(collectionIds = []) =>
        setNotification({
          open: true,
          message: `Added to ${collectionIds.join(',')}`,
          severity: 'success',
        })
      }
      BinItemComponent={CustomBinItemDraggable}
      BinItemProps={{
        DraggedComponent: CustomBinItem,
      }}
      CollectionCreateDialogProps={{
        onSuccess: ({ id }) => history.push(`/collection/${id}/`),
      }}
      BinProps={{ elevation: 0, square: true, variant: 'outlined' }}
    />
  );
}
