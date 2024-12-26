import { useEffect, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Badge,
  Box,
  ClickAwayListener,
  Link,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Popper,
  Stack,
  Typography,
  useMediaQuery,
  CircularProgress,
  Button
} from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import { ThemeMode } from 'config';

// assets
import { Bill, Car, Card, Notification, WalletMoney } from 'iconsax-react';
import Avatar from 'components/@extended/Avatar';
import { useNavigate } from 'react-router';
import axiosServices from 'utils/axios';

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

function formatDateTime(input) {
  const now = new Date(); // Current date and time
  const inputDate = new Date(input); // Input date

  // Helper to add leading zero for single-digit numbers
  const padZero = (num) => (num < 10 ? `0${num}` : num);

  // Helper to format time with AM/PM
  const formatTimeWithAmPm = (hours, minutes) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    return `${padZero(formattedHours)}:${padZero(minutes)} ${period}`;
  };

  // Helper to get month name
  const getMonthName = (monthIndex) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    return monthNames[monthIndex];
  };

  // Get date differences
  const isSameDay = now.toDateString() === inputDate.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === inputDate.toDateString();

  const hours = inputDate.getHours();
  const minutes = inputDate.getMinutes();
  const formattedTime = formatTimeWithAmPm(hours, minutes);

  if (isSameDay) {
    const diffMs = new Date() - inputDate; // Difference in milliseconds
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) {
      return { date: `${diffSecs} seconds ago`, time: formattedTime };
    } else if (diffHours < 1) {
      return { date: `${diffMins} minutes ago`, time: formattedTime };
    } else {
      return { date: `${diffHours} hours ago`, time: formattedTime };
    }
  } else if (isYesterday) {
    return { date: `Yesterday`, time: formattedTime };
  } else {
    // Fallback for other dates
    return { date: `${inputDate.getDate()} ${getMonthName(inputDate.getMonth())} ${inputDate.getFullYear()}`, time: formattedTime };
  }
}

const NotificationPage = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0); // State to track unread notifications
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetch, setFetch] = useState(false);

  // console.log('notifications', notifications);
  // console.log('unreadCount', unreadCount);

  const handleClick = () => {
    setOpen(false); // Close the NotificationPage
    navigate('/notification');
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const iconBackColorOpen = theme.palette.mode === ThemeMode.DARK ? 'secondary.200' : 'secondary.200';
  const iconBackColor = theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'secondary.100';

  // useEffect calling to get all notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosServices.get('/notification/');
        const notificationData = response.data.data;

        // If no notifications are found, set unread count to 0
        if (!notificationData || notificationData.length === 0) {
          setUnreadCount(0);
          setNotifications([]); // Set notifications to an empty array
          return;
        }

        // Filter unread notifications
        const unreadNotifications = notificationData.filter((item) => !item.is_read);

        // Set the unread count dynamically
        setUnreadCount(unreadNotifications.length);
        setNotifications(notificationData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchNotifications();
  }, [fetch]);

  // Handle Mark All Read
  const handleMarkAllRead = async () => {
    try {
      const displayedNotifications = notifications.slice(0, 5); // Only consider the first 5 notifications currently displayed
      const notificationIds = displayedNotifications.map((item) => item._id); // Collect their IDs

      if (notificationIds.length === 0) return;

      // Make the API request to mark the notifications as read
      await axiosServices.put('/notification/update/status', {
        data: { notificationIds, status: true }
      });

      // Update local state to mark the notifications as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notificationIds.includes(notification._id) ? { ...notification, is_read: true } : notification
        )
      );

      setFetch(true);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // picking icons according to notification type
  function getIconByType(type) {
    switch (type) {
      case 'ADVANCE':
        return (
          <Avatar type="filled">
            <Card size={20} variant="Bold" />
          </Avatar>
        );
      case 'INVOICE':
        return (
          <Avatar type="outlined">
            <Bill size={20} variant="Bold" />
          </Avatar>
        );
      case 'TRIP':
        return (
          <Avatar type="filled">
            <Car size={20} variant="Bold" />
          </Avatar>
        );
      case 'TRANSACTION':
        return (
          <Avatar type="outlined">
            <WalletMoney size={20} variant="Bold" />
          </Avatar>
        );
      case 'VEHICLE':
        return (
          <Avatar type="filled">
            <Car size={20} variant="Bold" />
          </Avatar>
        );
      default:
        return null;
    }
  }

  // Function to handle navigation based on notification type
  const handleNotificationClick = (type, id) => {
    let path = '';

    // Define paths based on notification type
    switch (type) {
      case 'ADVANCE':
        path = `/apps/invoices/advance`; // Example path for 'ADVANCE'
        break;
      case 'INVOICE':
        path = `/apps/invoices/company`; // Example path for 'INVOICE'
        break;
      case 'TRIP':
        path = `/apps/trips/list`; // Example path for 'TRIP'
        break;
      case 'TRANSACTION':
        path = `/expense/transaction`; // Example path for 'TRANSACTION'
        break;
      case 'VEHICLE':
        path = `/management/cab/view`; // Example path for 'VEHICLE'
        break;
      default:
        path = '/home'; // Default path if type is not recognized
        break;
    }

    // Navigate to the determined path
    navigate(path);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      <IconButton
        color="secondary"
        variant="light"
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        size="large"
        sx={{ color: 'secondary.main', bgcolor: open ? iconBackColorOpen : iconBackColor, p: 1 }}
      >
        <Badge badgeContent={unreadCount > 0 ? unreadCount : 0} color="success" sx={{ '& .MuiBadge-badge': { top: 2, right: 4 } }}>
          <Notification variant="Bold" />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? -5 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} sx={{ overflow: 'hidden' }} in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                borderRadius: 1.5,
                width: '100%',
                minWidth: 285,
                maxWidth: 420,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 285
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">Notifications</Typography>
                    {notifications.length > 0 && (
                      <Button
                        variant="text"
                        size="small"
                        onClick={handleMarkAllRead}
                        sx={{ textTransform: 'none', fontWeight: 500, color: 'primary.main' }}
                      >
                        Mark All Read
                      </Button>
                    )}
                  </Stack>
                  <List
                    component="nav"
                    sx={{
                      '& .MuiListItemButton-root': {
                        p: 1.5,
                        my: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          bgcolor: 'primary.lighter',
                          borderColor: theme.palette.primary.light
                        },
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((item) => {
                        const { date, time } = formatDateTime(item.createdAt);
                        return (
                          <ListItemButton key={item._id} onClick={() => handleNotificationClick(item.notificationType, item._id)}>
                            <ListItemAvatar>
                              {getIconByType(item.notificationType)} {/* Dynamic icon */}
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6">
                                  {item.content} {/* Notification Content */}
                                </Typography>
                              }
                              secondary={date}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" noWrap sx={{ fontWeight: 'bold' }}>
                                {time} {/* Display only the time */}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ p: 2 }}>
                        No new notifications
                      </Typography>
                    )}
                  </List>

                  <Stack direction="row" justifyContent="center">
                    <Link variant="h6" color="primary" onClick={handleClick}>
                      View all
                    </Link>
                  </Stack>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default NotificationPage;
