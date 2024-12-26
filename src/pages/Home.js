import useAuth from 'hooks/useAuth';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { dispatch } from 'store';
import { fetchAccountSettings } from 'store/slice/cabProvidor/accountSettingSlice';
import { fetchAllRoles } from 'store/slice/cabProvidor/roleSlice';
import { fetchAllVehicleTypes, fetchAllVehicleTypesForAll } from 'store/slice/cabProvidor/vehicleTypeSlice';
import { fetchZoneNames } from 'store/slice/cabProvidor/ZoneNameSlice';
import { fetchAllZoneTypes } from 'store/slice/cabProvidor/zoneTypeSlice';

const Home = () => {
  const { accountSetting } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accountSetting || !accountSetting._id) {
      navigate('/settings/account');
    }
  }, [accountSetting, navigate]);

  useEffect(() => {
    // dispatch(fetchAllVehicleTypesForAll());
    dispatch(fetchAllRoles());
    dispatch(fetchAllVehicleTypes());
    dispatch(fetchZoneNames());
    dispatch(fetchAllZoneTypes());
    dispatch(fetchAccountSettings());
  }, []);

  console.log('accountSetting', accountSetting);

  return <div></div>;
};

export default Home;
