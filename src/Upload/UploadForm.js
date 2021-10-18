import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';
import { TRAINING_METADATA_KEY, TRAINING_METADATA_VALUE } from '../const';

const styles = (theme) => ({
  form: {
    '& > *': {
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(1.5),
    },
  },
});

const UploadForm = ({ classes, onChange, values }) => {
  const training = React.useMemo(() => values[TRAINING_METADATA_KEY] === true, [values]);
  return (
    <div className={classes.root}>
      <div className={classes.form}>
        {!training && (
          <TextField
            onChange={onChange('title')}
            value={values.title}
            label="Title"
            variant="outlined"
            required
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        )}
        {training && (
          <TextField
            onChange={onChange(TRAINING_METADATA_VALUE)}
            value={values[TRAINING_METADATA_VALUE]}
            label="Face name"
            variant="outlined"
            required
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        )}
        {/*
        {values.trainingMaterial && (
          <>
            <TextField
              onChange={onChange('firstname')}
              value={values.firstname}
              label="First name"
              variant="outlined"
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              onChange={onChange('lastname')}
              value={values.lastname}
              label="Last name"
              variant="outlined"
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </>
        )}
        */}
      </div>
    </div>
  );
};

export default withStyles(styles, { name: 'VdtUploadForm' })(UploadForm);
