/*
Shell component
*/

import React from 'react';
import { useHistory } from "react-router-dom";
// for styles
import { makeStyles } from '@material-ui/core/styles';
// toolbar imports
import { AppBar, Toolbar } from '@material-ui/core';
// text and buttons
import { Typography, IconButton } from '@material-ui/core';
// menu and items
import { Menu, MenuItem } from '@material-ui/core';
// icons
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

// create styles
const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
	},
}));

export function Shell(props) {
	// import classes/styles
	const classes = useStyles();
	// history api for routing
	const history = useHistory();
	// state hook for user menu anchor element
	const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
	// boolean for menu state
	const menuOpen = Boolean(menuAnchorEl);

	// handler to set menu anchor
	const handleMenu = event => {
		setMenuAnchorEl(event.currentTarget);
	};
	// handler to clear menu anchor
	const handleClose = () => {
		setMenuAnchorEl(null);
	};

	return (
		<div className={classes.root}>
			<AppBar position="static">
				<Toolbar>
					<IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
						<MenuIcon />
					</IconButton>
					<Typography variant="h5" className={classes.title}>
						StrangeScout
					</Typography>
					
						<div>
							<IconButton
								aria-label="account of current user"
								aria-controls="menu-appbar"
								aria-haspopup="true"
								onClick={handleMenu}
								color="inherit"
							>
								<AccountCircleIcon />
							</IconButton>
							<Menu
								id="menu-appbar"
								anchorEl={menuAnchorEl}
								anchorOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								keepMounted
								transformOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								open={menuOpen}
								onClose={handleClose}
							>
								{props.loggedin ?
								[
									<MenuItem key={"profile"} onClick={handleClose}>Profile</MenuItem>,
									<MenuItem key={"account"} onClick={handleClose}>My account</MenuItem>,
									<MenuItem key={"logout"} onClick={handleClose}>Logout</MenuItem>
								].map(item => item)
								:
								[
									<MenuItem key={"login"} onClick={() => {history.push('/login'); handleClose();}}>Login</MenuItem>,
									<MenuItem key={"signup"} onClick={() => {history.push('/signup'); handleClose();}}>Sign Up</MenuItem>
								].map(item => item)
								}
							</Menu>
						</div>
				</Toolbar>
			</AppBar>
		</div>
	);
};
