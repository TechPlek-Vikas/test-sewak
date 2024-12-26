import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineContent, TimelineConnector } from '@mui/lab';
import { Card, Bill, Car, WalletMoney } from 'iconsax-react';
import MainCard from 'components/MainCard';
import axiosServices from 'utils/axios';
import { Button, Stack, Box, CircularProgress } from '@mui/material';
import EmptyTableDemo from 'components/tables/EmptyTable';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';
import { useNavigate } from 'react-router';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// picking icons according to notification type
function getIconByType(type) {
  switch (type) {
    case 'ADVANCE':
      return <Card size={24} variant="Bold" />;
    case 'INVOICE':
      return <Bill size={24} variant="Bold" />;
    case 'TRIP':
      return <Car size={24} variant="Bold" />;
    case 'TRANSACTION':
      return <WalletMoney size={24} variant="Bold" />;
    case 'VEHICLE':
      return <Car size={24} variant="Bold" />;
    default:
      return null;
  }
}

// formatting date to desired one for ex - Today - Wednesday, December 18, 2024
function formatDateTime(input) {
  const now = new Date();
  const inputDate = new Date(input);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[inputDate.getDay()];

  const monthName = inputDate.toLocaleString('default', { month: 'long' });
  const day = inputDate.getDate();
  const year = inputDate.getFullYear();

  const padZero = (num) => (num < 10 ? `0${num}` : num);
  const formatTimeWithAmPm = (hours, minutes) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${padZero(formattedHours)}:${padZero(minutes)} ${period}`;
  };

  const isSameDay = now.toDateString() === inputDate.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === inputDate.toDateString();

  const hours = inputDate.getHours();
  const minutes = inputDate.getMinutes();
  const formattedTime = formatTimeWithAmPm(hours, minutes);

  if (isSameDay) {
    return { date: `Today - ${dayName}, ${monthName} ${day}, ${year}`, time: formattedTime };
  }
  if (isYesterday) {
    return { date: `Yesterday - ${dayName}, ${monthName} ${day}, ${year}`, time: formattedTime };
  }

  return {
    date: `${dayName}, ${monthName} ${day}, ${year}`,
    time: formattedTime
  };
}

let breadcrumbLinks = [{ title: 'Home', to: APP_DEFAULT_PATH }, { title: 'Notification' }];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetch, setFetch] = useState(false);
  const navigate = useNavigate();

  // Group notifications by date
  const groupNotificationsByDate = (notifications) => {
    return notifications.reduce((groups, notification) => {
      const { date } = formatDateTime(notification.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(notification);
      return groups;
    }, {});
  };

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

  // useEffect calling to get all notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosServices.get('/notification/');
        const notification = response.data.data;
        setNotifications(notification);
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
      const notificationIds = notifications.map((item) => item._id); // Use notification._id
      if (notificationIds.length === 0) return;

      await axiosServices.put('/notification/update/status', {
        data: { notificationIds, status: true }
      });
      dispatch(
        openSnackbar({
          open: true,
          message: 'Notifications have been successfully marked as read!',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: false
        })
      );
      setFetch(true);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Show loading or empty table if no data
  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          width: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <>
        <Breadcrumbs custom links={breadcrumbLinks} />
        <EmptyTableDemo />
      </>
    );
  }

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <>
      <Breadcrumbs custom links={breadcrumbLinks} />
      <MainCard
        title={
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* Title on the left */}
            <Typography variant="h5">Notifications</Typography>
            {/* Mark All Read button on the right */}
            <Button
              variant="text"
              size="small"
              onClick={handleMarkAllRead}
              sx={{ textTransform: 'none', fontWeight: 500, color: 'primary.main' }}
            >
              Mark All Read
            </Button>
          </Stack>
        }
      >
        <Timeline
          position="right"
          sx={{
            '& .MuiTimelineItem-root:before': {
              content: 'none' // Disable the pseudo-element
            },
            '& .MuiTimelineItem-root': { minHeight: 100 },
            '& .MuiTimelineOppositeContent-root': { display: 'none' },
            '& .MuiTimelineDot-root': {
              borderRadius: 1.25,
              boxShadow: 'none',
              margin: 0,
              ml: 1.25,
              mr: 1.25,
              p: 1,
              '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
            },
            '& .MuiTimelineContent-root': {
              borderRadius: 1,
              bgcolor: 'secondary.lighter',
              height: '100%',
              textAlign: 'left' // Align content to the left
            },
            '& .MuiTimelineSeparator-root': {
              textAlign: 'right' // Align separators to the right
            },
            '& .MuiTimelineConnector-root': { border: '1px dashed', borderColor: 'secondary.light', bgcolor: 'transparent' }
          }}
        >
          {Object.keys(groupedNotifications).map((date, index) => (
            <div key={index}>
              <Typography variant="h6" color="textPrimary" sx={{ mb: 2, fontWeight: 'bold' }}>
                {date}
              </Typography>
              {groupedNotifications[date].map((item, index) => {
                const { time } = formatDateTime(item.createdAt);

                return (
                  <TimelineItem
                    key={index}
                    onClick={() => handleNotificationClick(item.notificationType, item._id)}
                    sx={{
                      cursor: 'pointer'
                    }}
                  >
                    <TimelineSeparator>
                      <TimelineDot
                        sx={{
                          color: item.is_read ? 'primary.darker' : 'warning.darker',
                          bgcolor: item.is_read ? 'primary.lighter' : 'warning.lighter'
                        }}
                      >
                        {getIconByType(item.notificationType)}
                      </TimelineDot>
                      {index !== groupedNotifications[date].length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent
                      style={{
                        backgroundColor: item.is_read ? '#F2F6FF' : '#FDF6ED'
                      }}
                    >
                      <Typography>{item.content || 'No details provided.'}</Typography>
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {`${time}`}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </div>
          ))}
        </Timeline>
      </MainCard>
    </>
  );
}
