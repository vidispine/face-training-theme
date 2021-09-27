import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { TextField } from '@vidispine/vdt-materialui';
import {
  Popover,
  Button,
  withStyles,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Divider,
  FormLabel,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

const styles = (theme) => ({
  openSearch: { marginLeft: 'auto' },
  formLabelContainer: {
    display: 'flex',
  },
  popOver: {
    padding: theme.spacing(1, 2),
    width: '28vw',
    minHeight: '34vh',
  },
  searchInput: {
    width: 250,
    padding: theme.spacing(2),
    display: 'block',
    '& button': {
      display: 'none',
    },
  },
  markAll: { padding: theme.spacing(0, 2) },
  filtersContainer: {
    display: 'flex',
    alignContent: 'baseline',
    flexWrap: 'wrap',
    minHeight: '18vh',
    overflow: 'auto',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
  filter: {
    flex: '1 32%',
  },
  setSelection: {
    display: 'block',
    marginLeft: 'auto',
    margin: theme.spacing(1),
  },
});

function SearchInFilters({ options = [], onChange, label, classes }) {
  const { t } = useTranslation();
  const [filters, setFilters] = React.useState();
  const [checkedFilterValues, setCheckedFilterValues] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = ({ currentTarget }) => {
    setAnchorEl(currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    if (options) setFilters(options.slice(1));
  }, [options]);

  const handleFilterSearch = ({ target: { value } }) => {
    const queryOptions = options
      .slice(1)
      .filter((option) => option.value.toLowerCase().startsWith(value.toLowerCase()));
    setFilters(queryOptions);
  };

  const handleCheckedFilterValue = ({ target: { value } }) => {
    if (checkedFilterValues.includes(value)) {
      setCheckedFilterValues((prevState) =>
        prevState.filter((filterValue) => filterValue !== value),
      );
    } else {
      setCheckedFilterValues((prevState) => [...prevState, value]);
    }
  };

  const handleSelectAll = () => {
    if (checkedFilterValues.length === filters.length) {
      setCheckedFilterValues([]);
    } else {
      setCheckedFilterValues(filters.map((filter) => filter.value));
    }
  };

  const handleSetSelection = () => {
    if (checkedFilterValues.length > 0) {
      onChange(checkedFilterValues);
      setCheckedFilterValues([]);
      handleClose(null);
    }
  };

  return (
    <>
      <div className={clsx(classes.formLabelContainer, 'VdtCheckboxGroupField-formLabelContainer')}>
        <FormLabel component="legend">{label}</FormLabel>
        <Button
          className={classes.openSearch}
          size="small"
          type="submit"
          onClick={handleClick}
          disableRipple
        >
          <SearchIcon />
        </Button>
      </div>
      <Popover
        classes={{ paper: classes.popOver }}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <TextField
          classes={{ root: classes.searchInput }}
          onChange={handleFilterSearch}
          label={label}
          helperText={null}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          className={classes.markAll}
          label={t('markAll')}
          onChange={handleSelectAll}
          control={<Checkbox checked={checkedFilterValues.length === options.slice(1).length} />}
        />
        <Divider />
        <div className={classes.filtersContainer}>
          {filters &&
            filters.map((filter) => (
              <FormControlLabel
                key={filter.value}
                onChange={handleCheckedFilterValue}
                label={filter.value}
                classes={{
                  root: classes.filter,
                }}
                control={
                  <Checkbox
                    name={filter.value}
                    value={filter.value}
                    checked={checkedFilterValues.includes(filter.value)}
                  />
                }
              />
            ))}
        </div>
        <Button
          className={classes.setSelection}
          variant="contained"
          color="primary"
          onClick={handleSetSelection}
        >
          {t('setSelection')}
        </Button>
      </Popover>
    </>
  );
}

export default withStyles(styles, { name: 'VdtSearchInFilters' })(SearchInFilters);
