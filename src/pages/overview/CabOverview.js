import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
// material-ui
import { Box, Tab, Tabs } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Book, Routing2 } from 'iconsax-react';
import Overview from 'sections/cabprovidor/cabManagement/cabOverview/Overview';
import TripDetail from 'sections/cabprovidor/cabManagement/cabOverview/TripDetails';
import { dispatch, useSelector } from 'store';
import { fetchCabDetails } from 'store/slice/cabProvidor/cabSlice';
import CustomCircularLoader from 'components/CustomCircularLoader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

const CabOverview = () => {
  const { id } = useParams(); // used to extract companyId to fetch company Data
  const vehicleId = id;

  const [activeTab, setActiveTab] = useState(0);

  const { loading, getSingleDetails: cabDetails } = useSelector((state) => state.cabs);
  console.log(`🚀 ~ CabOverview ~ loading:`, loading);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    dispatch(fetchCabDetails(id));
  }, [id]);

  let breadcrumbLinks = [
    { title: 'Home', to: APP_DEFAULT_PATH },
    { title: 'Cab', to: '/management/cab/view' },
    { title: `${cabDetails?.vehicleName}` }
  ];

  return (
    <>
      <Breadcrumbs custom links={breadcrumbLinks} />
      {loading ? (
        <CustomCircularLoader />
      ) : (
        <>
          <MainCard border={false}>
            <Box>
              <Tabs value={activeTab} onChange={handleChange} aria-label="Profile Tabs">
                <Tab label="Overview" icon={<Book />} iconPosition="start" />
                <Tab label="Trips" icon={<Routing2 />} iconPosition="start" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {activeTab === 0 && <Overview />}
                {activeTab === 1 && <TripDetail vehicleId={vehicleId} />}
              </Box>

              <Box sx={{ mt: 2.5 }}>
                <Outlet />
              </Box>
            </Box>
          </MainCard>
        </>
      )}
    </>
  );
};

export default CabOverview;
