import { withStyles } from '@material-ui/core';
import { withDrag, MediaCardHeader } from '@vidispine/vdt-materialui';
import { compose } from '@vidispine/vdt-react';

export default compose(
  withStyles({ isDragging: { opacity: 0.5 } }, { name: 'MediaCardHeaderDraggable' }),
  withDrag,
)(MediaCardHeader);
