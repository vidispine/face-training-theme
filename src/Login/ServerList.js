import React from 'react';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { noauth as NoAuthApi } from '@vidispine/vdt-api';
import { green } from '@material-ui/core/colors';

const hasErrorUrl = (value = '', helperText = 'Not a URL') => {
  const expression = /https?:\/\/[-a-zA-Z0-9@:%._+~#=]{2,256}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
  const regex = new RegExp(expression);
  const matches = value.match(regex);
  return matches ? undefined : helperText;
};

export default function ServerList({
  onClickServer,
  serverList = [],
  onAddServer,
  onRemoveServer,
  AppTitleComponent,
}) {
  const [onlineServers, setOnlineServers] = React.useState();
  const [isEditing, setIsEditing] = React.useState(serverList.length === 0);
  const [helperText, setHelperText] = React.useState();
  const [newServer, setNewServer] = React.useState('');
  const handleChange = (event) => {
    setNewServer(event.target.value);
  };
  const handleAddServer = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    const hasError = hasErrorUrl(newServer);
    if (hasError) {
      setHelperText(hasError);
      return;
    }
    onAddServer(newServer);
    setIsEditing(false);
    setNewServer('');
    setHelperText();
  };
  React.useEffect(() => {
    Promise.all(
      serverList.map(
        (baseURL) =>
          new Promise((resolve) =>
            NoAuthApi.getSelfTest({ baseURL })
              .then(() => resolve(true))
              .catch(() => resolve(false)),
          ),
      ),
    ).then((output) => setOnlineServers(output));
  }, [serverList]);
  const toggleEditing = (event) => setIsEditing(event.target.checked);
  return (
    <Container maxWidth="sm">
      <div style={{ height: '30vh' }} />
      <Grid container justifyContent="space-between" direction="row" style={{ width: '100%' }}>
        {AppTitleComponent && (
          <Grid item>
            <AppTitleComponent />
          </Grid>
        )}
        <Grid item>
          <FormControlLabel
            control={<Switch checked={isEditing} onChange={toggleEditing} />}
            label="Edit"
          />
        </Grid>
      </Grid>
      <List component="nav">
        {isEditing && (
          <ListItem>
            <form onSubmit={handleAddServer} style={{ width: '100%' }}>
              <TextField
                value={newServer}
                onChange={handleChange}
                label="Add Server"
                variant="outlined"
                fullWidth
                error={helperText !== undefined}
                helperText={helperText}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddServer}>
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </ListItem>
        )}
        {serverList.map((apiServer, idx) => (
          <ListItem
            key={apiServer}
            button={!isEditing}
            onClick={isEditing ? undefined : () => onClickServer(apiServer)}
          >
            <ListItemText primary={apiServer} />
            <ListItemSecondaryAction>
              {isEditing ? (
                <IconButton edge="end" onClick={() => onRemoveServer(apiServer)}>
                  <DeleteIcon />
                </IconButton>
              ) : (
                Array.isArray(onlineServers) &&
                (onlineServers[idx] === true ? (
                  <CheckCircleOutlineIcon style={{ color: green[500] }} />
                ) : (
                  <ErrorOutlineIcon color="error" />
                ))
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
