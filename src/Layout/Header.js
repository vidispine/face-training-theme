import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserAvatarButton, useThemeContext } from '@vidispine/vdt-materialui';
// import Grid from '@material-ui/core/Grid';
import { useMediaQuery, withStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import MUIButton from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import MenuItem from '@material-ui/core/MenuItem';
import FaceIcon from '@material-ui/icons/Face';
import { useTranslation } from 'react-i18next';
import AppTitle from '../AppTitle';
import i18n from '../i18n';
import { VIDISPINE_URL } from '../const';

import { TrainCollectionDialog } from '../Training/Dialogs';
import { useDialog, useSnackbar, useCognitiveResources } from '../Context';

const headerButtonLinkStyles = (theme) => ({
  root: {
    ...theme.typography.h6,
    textTransform: 'none',
    opacity: 0.8,
    paddingLeft: 0,
    marginRight: 20,
    '&::after': {
      color: theme.palette.primary.main,
      transition: 'width 0.25s ease-in-out 0.05s',
      borderBottom: '0.25em solid',
      width: 0,
      position: 'absolute',
      bottom: 0,
      left: 0,
      content: '""',
    },
    '&:hover, &.selected': {
      opacity: 1,
      backgroundColor: 'unset',
      '&::after': {
        width: 'calc(100% - 8px)',
      },
    },
  },
});

const Button = withStyles(headerButtonLinkStyles, { name: 'VdtHeaderButtonLink' })(MUIButton);

export default function Header({ userName, serverUrl, onLogout }) {
  const { t } = useTranslation();
  const breakpoint = useMediaQuery(({ breakpoints }) => breakpoints.down('sm'));
  const { showDialog } = useDialog();
  const { setNotification } = useSnackbar();
  const { resource: resourceList = [] } = useCognitiveResources();
  const switchServerUrl = React.useMemo(() => {
    const { href } = window.location;
    return href.split('server')[0];
  }, []);
  const { togglePalette, isDefaultPalette } = useThemeContext();

  const onToggleLanguage = (newLanguage) => i18n.changeLanguage(newLanguage);
  const onTogglePalette = () => togglePalette();

  const onClick = () =>
    showDialog({ Dialog: TrainCollectionDialog, resourceList })
      .then(() => setNotification({ open: true, message: 'Training started' }))
      .catch(
        ({ message }) => message && setNotification({ open: true, message, severity: 'error' }),
      );

  return (
    <AppBar position="relative">
      <Box
        px={2}
        py={0.5}
        bgcolor="#20232a"
        color="common.white"
        width="100%"
        display="grid"
        gridTemplateColumns={breakpoint ? '1fr auto' : 'auto 1fr auto'}
      >
        <Box gridRow={breakpoint ? '1' : 'initial'}>
          <AppTitle subheader={serverUrl} />
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gridColumn={breakpoint ? '1 / span 2' : 'initial'}
        >
          <Button
            activeClassName="selected"
            variant="text"
            component={NavLink}
            to="/import/"
            color="inherit"
            disableRipple
          >
            {t('upload')}
          </Button>
          <Button
            activeClassName="selected"
            variant="text"
            component={NavLink}
            to="/item/"
            color="inherit"
            disableRipple
          >
            {t('items')}
          </Button>
          <Button
            activeClassName="selected"
            variant="text"
            component={NavLink}
            to="/training/"
            color="inherit"
            disableRipple
          >
            {t('Faces')}
          </Button>
          <MUIButton
            startIcon={<FaceIcon />}
            onClick={onClick}
            variant="contained"
            color="primary"
            disableRipple
          >
            {t('Train faces')}
          </MUIButton>
        </Box>
        <Box display="flex" justifyContent="flex-end" gridRow={breakpoint ? '1' : 'initial'}>
          <UserAvatarButton
            userName={userName}
            onLogout={onLogout}
            togglePalette={onTogglePalette}
            isDefaultPalette={isDefaultPalette}
            locale={{
              set: (lang) => onToggleLanguage(lang),
              curr: i18n.language || '',
              options: [
                { label: 'Svenska', value: 'sv' },
                { label: 'English', value: 'en' },
                { label: 'Deutsch', value: 'de' },
              ],
            }}
          >
            {!VIDISPINE_URL && serverUrl && (
              <MenuItem component="a" href={switchServerUrl}>
                {t('Switch Server')}
              </MenuItem>
            )}
          </UserAvatarButton>
        </Box>
      </Box>
    </AppBar>
  );
}
