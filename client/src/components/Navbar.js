import { AppBar, Avatar, Button, Menu, MenuItem, Toolbar, Typography, IconButton, makeStyles } from '@material-ui/core';
import NavigationRoundedIcon from '@material-ui/icons/NavigationRounded';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import { COLORS } from '../constants/Colors';
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { getWithExpiry } from '../helpers/session-expire';
import { userActions } from '../actions/user.actions';
import { alertActions } from '../actions/alert.actions';
import Geocoder from 'react-native-geocoding';
import logo from '../images/logo.png'

const BS_URL_KEY = process.env.REACT_APP_BS_URL_KEY || '';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2),
    color: COLORS.highlight
  },
  title: {
    flexGrow: 1
  },
  location: {
    fontSize: "1em"
  },
  nav: {
    color: COLORS.black,
    margin: "1em",
    fontSize: "1em",
    textDecoration: "none",
    '&:hover': {
      textDecoration: "none",
      textDecorationColor: COLORS.highlight,
      color: COLORS.highlight,
      fontWeight: "bold"
    }
  }
}));

export default function Navbar(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const loggedIn = useSelector(state => state.user.loggedIn);
  const userData = useSelector(state => state.user.user);
  const avatar = userData?.data?.avatar;
  const avatarImage = avatar && new Buffer.from(avatar.data).toString("ascii");
  const dispatch = useDispatch();

  const TIME_OUT = 1000 * 60 * 60;

  useEffect(() => {
    if (!loggedIn) {
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  }, [loggedIn])

  let interval = useRef(null);
  useEffect(() => {
    if (isActive) {
      interval.current = setInterval(() => {
        if (!getWithExpiry('user')) {
          dispatch(alertActions.error("We are logging you out due to inactivity"));
          setTimeout(() => {
            dispatch(alertActions.clear());
            dispatch(userActions.logout());
          }, 3000);
        }
      }, TIME_OUT);
    }
    return () => clearInterval(interval.current);
  }, [isActive])

  const [currentLoc, setCurrentLoc] = React.useState({
    lat: 0,
    lng: 0
  });
  const [currentCity, setCurrentCity] = useState([])

  const getCurrentLongLat = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }


  const getCurrentCity = async () => {
    Geocoder.init(BS_URL_KEY);
    try {
      const position = await getCurrentLongLat();
      const currentLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      const json = await Geocoder.from(currentLoc)
      let currentCity = json.results[0].address_components[3].long_name
      setCurrentLoc(currentLoc);
      setCurrentCity(currentCity);
      return currentCity;

    } catch (error) {
      console.warn(error)
      return null;
    }
  }

  useEffect(() => {
    getCurrentCity();
  }, [])

  const handleClickMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleLogout = () => {
    setAnchorEl(null);
    return dispatch(userActions.logout());
  }

  const handleOpenProfile = () => {
    if (loggedIn) {
      props.handleOpenProfile();
    }
    setAnchorEl(null);
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" style={{ backgroundColor: "white", boxShadow: "none", padding: "0 10%", color: COLORS.black }}>
        <Toolbar>
          <Button edge="start" className={classes.menuButton} aria-label="navigation">
            <NavigationRoundedIcon />
            <a className={classes.location} style={{ color: COLORS.black }}>{currentCity}</a>
          </Button>
          <Link to="/" className={classes.title}>
            <Typography variant="h1" >
              <img style={{ marginLeft: 40, width: "9em" }} src={logo} alt={"logo"} />
            </Typography>
          </Link>
          <NavLink to="/home" className={classes.nav} activeStyle={{ fontWeight: "bold", color: COLORS.highlight, textDecorationColor: COLORS.highlight }}>
            Groups
          </NavLink>
          <NavLink to="/map" className={classes.nav} activeStyle={{ fontWeight: "bold", color: COLORS.highlight, textDecorationColor: COLORS.highlight }}>
            Map
          </NavLink>
          {
            loggedIn ?
              <div>
                <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClickMenu}>
                  {avatarImage ?
                    <Avatar src={avatarImage} alt={userData?.data?.username} style={{ height: 40, width: 40 }} /> :
                    <AccountCircleRoundedIcon style={{ height: 40, width: 40 }} />
                  }
                </IconButton>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleOpenProfile}>Profile</MenuItem>
                  <MenuItem onClick={handleClose}>
                    <Link to="/mygroups">
                      My Groups
                    </Link>
                  </MenuItem>
                  <MenuItem >
                    <Link to="/" onClick={handleLogout}>
                      Logout
                    </Link>
                  </MenuItem>
                </Menu>
              </div>
              :
              <NavLink to="/login" className={classes.nav} activeStyle={{ fontWeight: "bold", color: COLORS.highlight, textDecorationColor: COLORS.highlight }}>
                Login
              </NavLink>
          }
        </Toolbar>
      </AppBar>
    </div>
  );
}
