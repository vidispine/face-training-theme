import React from 'react';
import { withStyles, Button, Collapse, Typography, Box } from '@material-ui/core';
import { Upload } from '@vidispine/vdt-materialui';
import clsx from 'clsx';
import { UploadContext } from '../Context';
import UploadForm from './UploadForm';
import { TRAINING_METADATA_KEY } from '../const';

const styles = (theme) => ({
  root: {},
  buttonContainer: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: '1fr',
    gridGap: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  toggleButton: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    '&.large': {
      paddingTop: theme.spacing(10),
      paddingBottom: theme.spacing(10),
    },
    transition: theme.transitions.create('padding', {
      duration: theme.transitions.duration.shortest,
    }),
  },
});

const ItemUpload = ({ classes }) => {
  const { useUploadFiles, uploadType, setUploadType } = React.useContext(UploadContext);

  const { onChangeMetadata, files } = useUploadFiles({});

  const toggleUploadType = (type) => {
    if (type === uploadType) return;
    setUploadType(type);
    if (files.length > 0) {
      files.forEach((f, i) => {
        onChangeMetadata(i)({ [TRAINING_METADATA_KEY]: type === 'training' });
      });
    }
  };

  return (
    <>
      <Collapse in={!uploadType} timeout="auto" unmountOnExit>
        <Box p={2} py={6} display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h4">What are you uploading?</Typography>
        </Box>
      </Collapse>
      <div className={classes.buttonContainer}>
        <Button
          className={clsx(classes.toggleButton, { large: !uploadType })}
          variant={uploadType === 'content' ? 'contained' : 'outlined'}
          disableRipple
          onClick={() => toggleUploadType('content')}
          color="primary"
          fullWidth
        >
          Content
        </Button>
        <Button
          className={classes.toggleButton}
          onClick={() => toggleUploadType('training')}
          disableRipple
          variant={uploadType === 'training' ? 'contained' : 'outlined'}
          color="primary"
          fullWidth
        >
          Training material
        </Button>
      </div>
      <Collapse in={!!uploadType} timeout="auto" unmountOnExit>
        <Upload
          useUploadFiles={useUploadFiles}
          UploadEditorProps={{
            UploadFormComponent: UploadForm,
            UploadFormProps: { trainingMaterial: uploadType === 'training' },
          }}
        />
      </Collapse>
    </>
  );
};

export default withStyles(styles)(ItemUpload);
