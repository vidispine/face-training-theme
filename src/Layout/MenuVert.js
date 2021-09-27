import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import ButtonBase from '@material-ui/core/ButtonBase';
import MoreVertIcon from '@material-ui/icons/MoreVert';

export default function MenuVert({
  icon: IconComponent = MoreVertIcon,
  children,
  onOpen = () => null,
  ...props
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    onOpen(event);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton component={ButtonBase} onClick={handleMenuClick} disableRipple>
        <IconComponent
          {...props} // eslint-disable-line react/jsx-props-no-spreading
        />
      </IconButton>
      <Menu
        onClick={handleMenuClose}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        elevation={1}
        PaperProps={{ square: true }}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {children}
      </Menu>
    </>
  );
}
