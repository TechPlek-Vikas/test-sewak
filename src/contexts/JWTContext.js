/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import { createContext, useEffect } from 'react';

// third-party
import { Chance } from 'chance';
import jwtDecode from 'jwt-decode';

// reducer - state management
import { INITIALIZE, LOGIN, LOGOUT } from 'store/reducers/actions';

// project-imports
import axios from 'utils/axios';
import axios1 from 'axios';

import { useDispatch, useSelector } from 'react-redux';
import { MODULE, PERMISSIONS, USERTYPE } from 'constant';
import CustomCircularLoader from 'components/CustomCircularLoader';
import { dispatch as reducerDispatch } from 'store';
import { logoutActivity } from 'store/slice/cabProvidor/accountSettingSlice';

const x = {
  [MODULE.ROSTER]: [PERMISSIONS.CREATE],

  [MODULE.USER]: [PERMISSIONS.READ],
  [MODULE.COMPANY]: [PERMISSIONS.READ, PERMISSIONS.CREATE],
  [MODULE.VENDOR]: [PERMISSIONS.READ, PERMISSIONS.CREATE],
  [MODULE.DRIVER]: [PERMISSIONS.READ],
  [MODULE.CAB]: [PERMISSIONS.READ],

  [MODULE.ROLE]: [PERMISSIONS.READ, PERMISSIONS.UPDATE, PERMISSIONS.DELETE],
  [MODULE.ZONE]: [PERMISSIONS.READ, PERMISSIONS.CREATE, PERMISSIONS.DELETE],
  [MODULE.ZONE_TYPE]: [PERMISSIONS.READ, PERMISSIONS.CREATE, PERMISSIONS.UPDATE],
  [MODULE.CAB_TYPE]: [PERMISSIONS.READ, PERMISSIONS.DELETE, PERMISSIONS.CREATE],
  [MODULE.CAB_RATE]: [PERMISSIONS.READ],
  [MODULE.CAB_RATE_VENDOR]: [PERMISSIONS.READ],
  [MODULE.CAB_RATE_DRIVER]: [PERMISSIONS.CREATE],

  [MODULE.INVOICE]: [PERMISSIONS.READ],
  [MODULE.REPORT]: [PERMISSIONS.READ],
  [MODULE.LOAN]: [PERMISSIONS.READ],
  [MODULE.ADVANCE]: [PERMISSIONS.READ, PERMISSIONS.CREATE],
  [MODULE.ADVANCE_TYPE]: [PERMISSIONS.READ, PERMISSIONS.CREATE, PERMISSIONS.UPDATE]
};

// const x = null;

const chance = new Chance();

// Define the structure of your decoded JWT token if needed
const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(serviceToken);
    // change token verification logic here

    // return decoded.exp > Date.now() / 1000;
    return !!decoded;
  } catch (error) {
    console.error('Token verification failed', error);
    return false;
  }
};

const setSession = (serviceToken) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common['Authorization'] = `${serviceToken}`; // Added `Bearer` for better token handling
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  // useEffect(() => {
  //   // this function will check the session validation and will redirect to home/ login page
  //   const init = async () => {
  //     try {
  //       const serviceToken = localStorage.getItem('serviceToken');
  //       if (serviceToken && verifyToken(serviceToken)) {
  //         setSession(serviceToken);
  //         const response = await axios.get('/user/view');
  //         // eslint-disable-next-line no-unused-vars
  //         // console.log(response.data);
  //         // if
  //         const accountSettingResponse = await axios1.get(`${process.env.REACT_APP_API_URL}accountSetting`, {
  //           headers: {
  //             Authorization: `${serviceToken}` // Authorization header with token
  //           }
  //         });
  //         console.log('accountSettingResponse', accountSettingResponse);

  //         // console.log("accountSettingResponse",accountSettingResponse);
  //         const accountSetting = accountSettingResponse?.data?.data;
  //         console.log('accountSetting', accountSetting);

  //         const { userData, userSpecificData, userPermissions } = response.data;
  //         // console.log(userData, userSpecificData, userPermissions)
  //         dispatch({
  //           type: LOGIN,
  //           payload: {
  //             user: userData,
  //             userType: userData.userType,
  //             userSpecificData: userSpecificData,
  //             userPermissions: userPermissions,
  //             accountSetting: accountSetting
  //           }
  //         });
  //       } else {
  //         dispatch({
  //           type: LOGOUT
  //         });
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       dispatch({
  //         type: LOGOUT
  //       });
  //     } finally {
  //       dispatch({
  //         type: INITIALIZE
  //       });
  //     }
  //   };

  //   init();
  // }, [dispatch]); // Added `dispatch` dependency

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          const response = await axios.get('/user/view');

          const { userData, userSpecificData, userPermissions } = response.data;

          // Skip account settings for superAdmin
          let accountSetting = null;
          if (userData.userType !== USERTYPE.superAdmin) {
            const accountSettingResponse = await axios1.get(`${process.env.REACT_APP_API_URL}accountSetting`, {
              headers: {
                Authorization: `${serviceToken}`
              }
            });
            console.log('accountSettingResponse', accountSettingResponse);
            accountSetting = accountSettingResponse?.data?.data;
          }

          dispatch({
            type: LOGIN,
            payload: {
              user: userData,
              userType: userData.userType,
              userSpecificData: userSpecificData,
              userPermissions: userPermissions,
              accountSetting: accountSetting
            }
          });
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      } finally {
        dispatch({
          type: INITIALIZE
        });
      }
    };

    init();
  }, [dispatch]);

  // const login = async (email, password) => {
  //   const payload = {
  //     data: {
  //       userEmail: email,
  //       userPassword: password
  //     }
  //   };

  //   const response = await axios.post('/user/login', payload);
  //   const { userData, userSpecificData, userPermissions } = response.data;

  //   // const accountSettingResponse = await axios.get('/accountSetting/');

  //   const accountSettingResponse = await axios1.get(`${process.env.REACT_APP_API_URL}accountSetting`, {
  //     headers: {
  //       Authorization: `${userData.token}` // Authorization header with token
  //     }
  //   });
  //   // c
  //   // console.log("accountSettingResponse",accountSettingResponse);
  //   const accountSetting = accountSettingResponse?.data?.data;
  //   console.log('accountSetting', accountSetting);

  //   const userInfo = {
  //     // userId: userData.userType === USERTYPE.iscabProviderUser ? userSpecificData.cabProviderId : userData._id,
  //     userId: userData._id,
  //     userType: userData.userType
  //   };

  //   localStorage.setItem('userInformation', JSON.stringify(userInfo));

  //   setSession(userData.token);
  //   dispatch({
  //     type: LOGIN,
  //     payload: {
  //       user: userData,
  //       userType: userData.userType,
  //       userSpecificData: userSpecificData,
  //       // userPermissions: x
  //       userPermissions: userPermissions,
  //       accountSetting: accountSetting
  //     }
  //   });
  // };

  const login = async (receivedPayload) => {
    const payload = {
      data: receivedPayload
    };

    const response = await axios.post('/user/login', payload);
    const { userData, userSpecificData, userPermissions } = response.data;

    // Skip account settings for superAdmin
    let accountSetting = null;
    if (userData.userType !== USERTYPE.superAdmin) {
      const accountSettingResponse = await axios1.get(`${process.env.REACT_APP_API_URL}accountSetting`, {
        headers: {
          Authorization: `${userData.token}`
        }
      });
      console.log('accountSettingResponse', accountSettingResponse);
      accountSetting = accountSettingResponse?.data?.data;
    }

    const userInfo = {
      userId: userData._id,
      userType: userData.userType
    };

    localStorage.setItem('userInformation', JSON.stringify(userInfo));

    setSession(userData.token);
    dispatch({
      type: LOGIN,
      payload: {
        user: userData,
        userType: userData.userType,
        userSpecificData: userSpecificData,
        userPermissions: userPermissions,
        accountSetting: accountSetting
      }
    });
  };

  const register = async (formData) => {
    try {
      // Recode this flow to ensure user verification logic
      const response = await axios.post('/user/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.log('Error registering user:', error);
      throw error;
      // dispatch(openSnackbar({ message: 'Error registering user', variant: 'error', open: true, close: true }));
    }
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
    reducerDispatch(logoutActivity());
  };

  const OTPSend = async (email) => {
    const payload = {
      data: {
        userEmail: email
      }
    };

    try {
      const response = await axios.post('/user/send/otp', payload);
      // console.log('OTP sent successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error sending OTP:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    const payload = {
      data: {
        userEmail: email,
        OTP: otp
      }
    };

    try {
      const response = await axios.post('/user/verify/otp', payload);
      // console.log('OTP verified successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error verifying OTP:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const resetPassword = async (email, newPassword) => {
    const payload = {
      data: {
        userEmail: email,
        userPassword: newPassword
      }
    };

    try {
      const response = await axios.post('/user/reset/password', payload);
      // console.log('Password reset successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error resetting password:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const updateProfile = () => {
    // Handle profile update logic
  };
  if (auth.isInitialized !== undefined && !auth.isInitialized) {
    // return <Loader />;
    return <CustomCircularLoader />;
  }
  return (
    <JWTContext.Provider
      value={{
        ...auth, // Assuming auth contains the necessary state
        login,
        logout,
        register,
        resetPassword,
        updateProfile,
        verifyOTP,
        OTPSend
      }}
    >
      {children}
    </JWTContext.Provider>
  );
};

JWTProvider.propTypes = {
  children: PropTypes.node.isRequired // Ensure children are required
};

export default JWTContext;
