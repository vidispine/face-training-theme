import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { TextField, Switch as SwitchField, FormControlLabel } from '@material-ui/core';
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
  const checked = React.useMemo(() => values[TRAINING_METADATA_KEY] === true, [values]);
  return (
    <div className={classes.root}>
      <div className={classes.form}>
        {!checked && (
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
        {checked && (
          <TextField
            onChange={onChange(TRAINING_METADATA_VALUE)}
            value={values[TRAINING_METADATA_VALUE]}
            label="Name"
            variant="outlined"
            required
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        )}
        <FormControlLabel
          control={
            <SwitchField
              onChange={onChange(TRAINING_METADATA_KEY)}
              checked={checked}
              label="Training material"
            />
          }
          label="Training material"
        />
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
