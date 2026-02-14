import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import mis from '../assets/mis.png';
import styles from './scss/sidebar.module.scss';

export default function NestedList({ 
  width = '100%', 
  onToggleSidebar, 
  isCollapsed,
  isMobileDrawer = false, // New prop to indicate if this is inside a mobile drawer
  onCloseMobileDrawer, // Callback to close mobile drawer
}) {
  const location = useLocation();

  // Custom breakpoints matching your SCSS
  const isXs = useMediaQuery('(max-width:575.98px)');
  const isSm = useMediaQuery('(max-width:768px)');
  const isMd = useMediaQuery('(max-width:991.98px)');
  const isLg = useMediaQuery('(max-width:1199.98px)');

  const [openItems, setOpenItems] = React.useState({
    MASTERLIST: location.pathname.startsWith('/role') || 
                location.pathname.startsWith('/users') || 
                location.pathname.startsWith('/team') || 
                location.pathname.startsWith('/charging'),
    SYSTEMS: location.pathname.startsWith('/sdlc'),
  });

  const handleToggle = (item) => {
    setOpenItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const isActiveRoute = (route) => location.pathname === route;

  // Handle navigation link click - close mobile drawer if applicable
  const handleNavLinkClick = () => {
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <Box 
      sx={{ 
        width, 
        height: '100%', 
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isCollapsed && !isMobileDrawer ? (
        // Collapsed sidebar - icons only (Desktop only)
        <List className={styles.list}>
          <ListSubheader
            component="div"
            sx={{
              bgcolor: '#f4f4f4',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 0.5,
              padding: '0.5rem',
              minHeight: { xs: '60px', sm: '70px', md: '80px' },
            }}
          >
            {/* Toggle button at top */}
            <Tooltip title="Expand sidebar" placement="right">
              <IconButton
                onClick={onToggleSidebar}
                size="small"
                sx={{ color: '#070606' }}
              >
                <MenuIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
            {/* Logo only in collapsed state */}
            <img 
              src={mis} 
              alt="MIS Logo" 
              className={styles.logo}
              style={{
                width: isXs ? '32px' : isSm ? '36px' : '40px',
                height: isXs ? '32px' : isSm ? '36px' : '40px',
                
              }}
            />
          </ListSubheader>

          <Tooltip title="Dashboard" placement="right">
            <NavLink
              to="/Dashboard"
              style={{ textDecoration: 'none', color: 'inherit' }}
              className={({ isActive }) =>
                `${styles.listItem} ${isActive ? styles.active : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <ListItemButton 
                sx={{ 
                  justifyContent: 'center',
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <HomeIcon fontSize={isXs ? "small" : "medium"} />
                </ListItemIcon>
              </ListItemButton>
            </NavLink>
          </Tooltip>

<Tooltip title="System" placement="right">
            <NavLink
              to="/Systems"
              style={{ textDecoration: 'none', color: 'inherit' }}
              className={({ isActive }) =>
                `${styles.listItem} ${isActive ? styles.active : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <ListItemButton 
                sx={{ 
                  justifyContent: 'center',
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <HomeIcon fontSize={isXs ? "small" : "medium"} />
                </ListItemIcon>
              </ListItemButton>
            </NavLink>
          </Tooltip>

          <Tooltip title="Role" placement="right">
            <NavLink
              to="/role"
              style={{ textDecoration: 'none', color: 'inherit' }}
              className={({ isActive }) =>
                `${styles.listItem} ${isActive ? styles.active : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <ListItemButton 
                sx={{ 
                  justifyContent: 'center',
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <PersonIcon fontSize={isXs ? "small" : "medium"} />
                </ListItemIcon>
              </ListItemButton>
            </NavLink>
          </Tooltip>

          <Tooltip title="Users" placement="right">
            <NavLink
              to="/users"
              style={{ textDecoration: 'none', color: 'inherit' }}
              className={({ isActive }) =>
                `${styles.listItem} ${isActive ? styles.active : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <ListItemButton 
                sx={{ 
                  justifyContent: 'center',
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <PeopleIcon fontSize={isXs ? "small" : "medium"} />
                </ListItemIcon>
              </ListItemButton>
            </NavLink>
          </Tooltip>

          <Tooltip title="Team" placement="right">
            <NavLink
              to="/team"
              style={{ textDecoration: 'none', color: 'inherit' }}
              className={({ isActive }) =>
                `${styles.listItem} ${isActive ? styles.active : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <ListItemButton 
                sx={{ 
                  justifyContent: 'center',
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <GroupsIcon fontSize={isXs ? "small" : "medium"} />
                </ListItemIcon>
              </ListItemButton>
            </NavLink>
          </Tooltip>

          <Tooltip title="Sdlc" placement="right">
            <NavLink
              to="/sdlc"
              style={{ textDecoration: 'none', color: 'inherit',  }}
              className={({ isActive }) =>
                `${styles.listItem} ${isActive ? styles.active : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <ListItemButton 
                sx={{ 
                  justifyContent: 'center',
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <LibraryBooksIcon fontSize={isXs ? "small" : "medium"} />
                </ListItemIcon>
              </ListItemButton>
            </NavLink>
          </Tooltip>

          <Tooltip title="Charging" placement="right">
            <NavLink
              to="/charging"
              style={{ textDecoration: 'none', color: 'inherit' }}
              className={({ isActive }) =>
                `${styles.listItem} ${isActive ? styles.active : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <ListItemButton 
                sx={{ 
                  justifyContent: 'center',
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <LocationCityIcon fontSize={isXs ? "small" : "medium"} />
                </ListItemIcon>
              </ListItemButton>
            </NavLink>
          </Tooltip>
        </List>
      ) : (
        // Expanded sidebar - full content
        <List
          className={styles.list}
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={
            <ListSubheader
              component="div"
              id="nested-list-subheader"
              className={styles.header}
              sx={{
                bgcolor: '#f4f4f4',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: isMobileDrawer ? '0.5rem' : 0,
                paddingLeft: { xs: '0.5rem', sm: '1rem' },
                minHeight: { xs: '60px', sm: '70px', md: '80px' },
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 0.5, sm: 1 },
                justifyContent: 'center',
              }}>
                <img 
                  src={mis} 
                  alt="MIS Logo" 
                  className={styles.logo}
                  style={{
                    width: isXs ? '32px' : isSm ? '36px' : '40px',
                    height: isXs ? '32px' : isSm ? '36px' : '40px',
                  }}
                />
                <h3 
                  className={styles.title}
                  style={{
                    fontSize: isXs ? '1rem' : isSm ? '1.1rem' : '1.25rem',
                    margin: 0,
                  }}
                >
                  Beacon
                </h3>
              </Box>

              {/* Close button for mobile drawer only */}
             
            </ListSubheader>
          }
        >
          {/* HOME */}
          <NavLink
            to="/Dashboard"
            style={{ textDecoration: 'none', color: 'inherit' }}
            className={({ isActive }) =>
              `${styles.listItem} ${isActive ? styles.active : ''}`
            }
            onClick={handleNavLinkClick}
          >
            <ListItemButton 
              sx={{ 
                mt: { xs: 2, sm: 4, md: 7 },
                py: { xs: 1, sm: 1.5 },
              }}
            >
              <ListItemIcon className={styles.listItemIcon}>
                <HomeIcon fontSize={isXs ? "small" : "medium"} />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                className={styles.listItemText}
                primaryTypographyProps={{
                  fontSize: isXs ? '0.875rem' : isSm ? '0.9rem' : '1rem',
                }}
              />
            </ListItemButton>
          </NavLink>

          <NavLink
            to="/Systems"
            style={{ textDecoration: 'none', color: 'inherit' }}
            className={({ isActive }) =>
              `${styles.listItem} ${isActive ? styles.active : ''}`
            }
            onClick={handleNavLinkClick}
          >
            <ListItemButton>
              <ListItemIcon className={styles.listItemIcon}>
                <HomeIcon fontSize={isXs ? "small" : "medium"} />
              </ListItemIcon>
              <ListItemText 
                primary="Systems" 
                className={styles.listItemText}
                primaryTypographyProps={{
                  fontSize: isXs ? '0.875rem' : isSm ? '0.9rem' : '1rem',
                }}
              />
            </ListItemButton>
          </NavLink>

          {/* MASTERLIST */}
          <ListItemButton 
            onClick={() => handleToggle('MASTERLIST')} 
            className={styles.listItem}
            sx={{ py: { xs: 1, sm: 1.5 } }}
          >
            <ListItemIcon className={styles.listItemIcon}>
              <LibraryBooksIcon fontSize={isXs ? "small" : "medium"} />
            </ListItemIcon>
            <ListItemText 
              primary="MasterList" 
              className={styles.listItemText}
              primaryTypographyProps={{
                fontSize: isXs ? '0.875rem' : isSm ? '0.9rem' : '1rem',
              }}
            />
            {openItems['MASTERLIST'] ? (
              <ExpandLess fontSize={isXs ? "small" : "medium"} />
            ) : (
              <ExpandMore fontSize={isXs ? "small" : "medium"} />
            )}
          </ListItemButton>
          <Collapse in={openItems['MASTERLIST']} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <NavLink
                to="/role"
                style={{ textDecoration: 'none', color: 'inherit' }}
                className={({ isActive }) =>
                  `${styles.listItem} ${isActive ? styles.active : ''}`
                }
                onClick={handleNavLinkClick}
              >
                <ListItemButton 
                  className={styles.nestedItem}
                  sx={{ 
                    pl: { xs: 3, sm: 4 },
                    py: { xs: 0.75, sm: 1 },
                  }}
                >
                  <ListItemIcon className={styles.listItemIcon}>
                    <PersonIcon fontSize={isXs ? "small" : "medium"} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Role" 
                    className={styles.listItemText}
                    primaryTypographyProps={{
                      fontSize: isXs ? '0.8rem' : isSm ? '0.85rem' : '0.9rem',
                    }}
                  />
                </ListItemButton>
              </NavLink>

              <NavLink
                to="/users"
                style={{ textDecoration: 'none', color: 'inherit' }}
                className={({ isActive }) =>
                  `${styles.listItem} ${isActive ? styles.active : ''}`
                }
                onClick={handleNavLinkClick}
              >
                <ListItemButton 
                  className={styles.nestedItem}
                  sx={{ 
                    pl: { xs: 3, sm: 4 },
                    py: { xs: 0.75, sm: 1 },
                  }}
                >
                  <ListItemIcon className={styles.listItemIcon}>
                    <PeopleIcon fontSize={isXs ? "small" : "medium"} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Users" 
                    className={styles.listItemText}
                    primaryTypographyProps={{
                      fontSize: isXs ? '0.8rem' : isSm ? '0.85rem' : '0.9rem',
                    }}
                  />
                </ListItemButton>
              </NavLink>

              <NavLink
                to="/team"
                style={{ textDecoration: 'none', color: 'inherit' }}
                className={({ isActive }) =>
                  `${styles.listItem} ${isActive ? styles.active : ''}`
                }
                onClick={handleNavLinkClick}
              >
                <ListItemButton 
                  className={styles.nestedItem}
                  sx={{ 
                    pl: { xs: 3, sm: 4 },
                    py: { xs: 0.75, sm: 1 },
                  }}
                >
                  <ListItemIcon className={styles.listItemIcon}>
                    <GroupsIcon fontSize={isXs ? "small" : "medium"} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="TEAM" 
                    className={styles.listItemText}
                    primaryTypographyProps={{
                      fontSize: isXs ? '0.8rem' : isSm ? '0.85rem' : '0.9rem',
                    }}
                  />
                </ListItemButton>
              </NavLink>

              <NavLink
                to="/charging"
                style={{ textDecoration: 'none', color: 'inherit' }}
                className={({ isActive }) =>
                  `${styles.listItem} ${isActive ? styles.active : ''}`
                }
                onClick={handleNavLinkClick}
              >
                <ListItemButton 
                  className={styles.nestedItem}
                  sx={{ 
                    pl: { xs: 3, sm: 4 },
                    py: { xs: 0.75, sm: 1 },
                  }}
                >
                  <ListItemIcon className={styles.listItemIcon}>
                    <LocationCityIcon fontSize={isXs ? "small" : "medium"} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Charging" 
                    className={styles.listItemText}
                    primaryTypographyProps={{
                      fontSize: isXs ? '0.8rem' : isSm ? '0.85rem' : '0.9rem',
                    }}
                  />
                </ListItemButton>
              </NavLink>
              
            </List>
          </Collapse>
        </List>
      )}
    </Box>
  );
}