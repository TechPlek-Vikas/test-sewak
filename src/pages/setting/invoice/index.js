import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import { useFormik, FormikProvider, Form } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import InvoiceSettingsFormContent from './InvoiceSettingsFormContent';
import { Box, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, Grid, Stack } from '@mui/material';
import CustomCircularLoader from 'components/CustomCircularLoader';
import { useNavigate } from 'react-router';
import { openSnackbar } from 'store/reducers/snackbar';
import { width } from '@mui/system';
import { getApiResponse } from 'utils/axiosHelper';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import WrapperButton from 'components/common/guards/WrapperButton';
import { MODULE, PERMISSIONS } from 'constant';

export const TAX_TYPE = {
  INDIVIDUAL: 'Individual',
  GROUP: 'Group'
};

export const DISCOUNT_TYPE = {
  ...TAX_TYPE,
  NO: 'No'
};

const DISCOUNT_BY = {
  PERCENTAGE: 'Percentage',
  AMOUNT: 'Amount'
};

export const STATUS = {
  YES: 1,
  NO: 0
};

const SETTINGS = {
  invoice: {
    preFix: 'INV',
    invoiceNumber: 1
  },

  tax: {
    // apply: TAX_TYPE.INDIVIDUAL,
    apply: TAX_TYPE.GROUP
  },
  discount: {
    apply: DISCOUNT_TYPE.INDIVIDUAL,
    // apply: DISCOUNT_TYPE.GROUP,
    // by: DISCOUNT_BY.PERCENTAGE,

    by: DISCOUNT_BY.AMOUNT
  },
  additionalCharges: STATUS.YES,
  roundOff: STATUS.YES
};

const getInitialValues = (data) => {
  console.log(`🚀 ~ getInitialValues ~ data:`, data);
  return {
    taxType: data?.tax?.apply || TAX_TYPE.INDIVIDUAL,
    discountType: data?.discount?.apply || DISCOUNT_TYPE.NO,
    discountBy: data?.discount?.by || DISCOUNT_BY.PERCENTAGE,
    additionalCharges: data?.additionalCharges || STATUS.NO,
    roundOff: data?.roundOff || STATUS.NO,
    invoicePrefix: data?.invoice?.prefix || '',
    invoiceNumber: data?.invoice?.invoiceNumber || 0
  };
};

const InvoiceSetting = ({ redirect, onClose }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('Api call for get settings');
    (async () => {
      try {
        setLoading(true);
        // TODO : Get settings from API

        const cabProviderId = JSON.parse(localStorage.getItem('userInformation'))?.userId || '';
        const url = `/invoice/settings/list`;
        const config = {
          params: {
            cabProviderId
          }
        };

        const response = await getApiResponse(url);
        console.log(`🚀 ~ response:`, response);

        if (response.success) {
          if (!response.data) {
            setSettings({});
            setLoading(false);
            return;
          }

          const { invoiceSetting } = response.data;
          console.log(invoiceSetting);
          setSettings(invoiceSetting);
          setLoading(false);
          console.log('Api call done .......');
        }
        // await new Promise((resolve) => setTimeout(resolve, 3000));

        // setSettings(SETTINGS);

        // setLoading(false);
        // console.log('Api call done .......');
      } catch (error) {
        console.log('Error fetching settings: (Invoice Setting)', error);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Error fetching settings: (Invoice Setting)',
            variant: 'error',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  console.log('settings', settings);

  const handleFormikSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      console.log('Formik submit', values);

      if (!values.invoicePrefix) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Please enter invoice prefix',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
        return;
      }

      let response;

      // TODO : Update settings API
      console.log('Update API call');
      const payload = {
        data: {
          invoiceSettingsId: settings?._id || '',
          discountApply: values.discountType,
          discountBy: values.discountBy,
          additionalCharges: values.additionalCharges,
          roundOff: values.roundOff,
          taxApply: values.taxType,
          // prefix: values.invoicePrefix,
          // invoiceNumber: values.invoiceNumber,
          ...(redirect ? {} : { prefix: values.invoicePrefix, invoiceNumber: values.invoiceNumber }),
          terms: ['']
        }
      };
      console.log(`🚀 ~ handleFormikSubmit ~ payload:`, payload);

      response = await axios.put('/invoice/settings/update', payload);

      // const response = {
      //   status: 200
      // };

      resetForm();

      setSubmitting(false);

      dispatch(
        openSnackbar({
          open: true,
          message: `Settings ${redirect ? 'updated' : 'saved'} successfully`,
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );

      if (redirect) {
        onClose();
        navigate(redirect, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.log('Error at handleFormikSubmit: ', error);
      dispatch(
        openSnackbar({
          open: true,
          message: `Something went wrong while ${redirect ? 'updating' : 'saving'} settings`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: getInitialValues(settings),
    enableReinitialize: true,
    onSubmit: handleFormikSubmit
  });

  // Memoized helper function for button label
  const buttonLabel = useMemo(() => {
    if (formik.isSubmitting) {
      return redirect ? 'Updating...' : 'Saving...';
    }
    return redirect ? 'Save & Continue' : 'Save';
  }, [formik.isSubmitting, redirect]);

  return (
    <>
      {loading ? (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh'
            }}
          >
            <CustomCircularLoader />
          </Box>
        </>
      ) : (
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
            <MainCard title={redirect ? 'Set Your Transaction Preferences' : 'Create Invoice Settings'}>
              <Stack gap={3}>
                <InvoiceSettingsFormContent redirect={redirect} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Stack direction="row" spacing={2} justifyContent={'flex-end'}>
                    <WrapperButton moduleName={MODULE.INVOICE_SETTING} permission={PERMISSIONS.CREATE}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={formik.isSubmitting}
                        startIcon={formik.isSubmitting && <CircularProgress size={20} />}
                      >
                        {buttonLabel}
                      </Button>
                    </WrapperButton>
                  </Stack>
                </Box>
              </Stack>
            </MainCard>
          </Form>
        </FormikProvider>
      )}
    </>
  );
};

InvoiceSetting.propTypes = {
  redirect: PropTypes.string,
  onClose: PropTypes.func
};

export default InvoiceSetting;
