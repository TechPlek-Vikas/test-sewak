import PropTypes from 'prop-types';

// third-party
import { Page, View, Document, StyleSheet } from '@react-pdf/renderer';

// project-imports
import Header from './Header';
import Content from './Content';

const styles = StyleSheet.create({
  page: {
    padding: 30
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    '@media max-width: 400': {
      flexDirection: 'column'
    }
  }
});

// ==============================|| INVOICE EXPORT  ||============================== //

const ExportPDFView = ({ list }) => {
  console.log('list = ', list);
  //   let title = list?.invoiceId || list?.invoice_id;
  //   let customer_name = list?.customer_name || list?.from?.name || list?.customerInfo?.name;

  const From = list?.billedBy?.cabProviderLegalName || 'Unknown';
  const To = list?.billedTo.company_name;

  return (
    <Document title={`${From}-${To}`}>
      <Page size="A4" style={styles.page}>
        <Header list={list} />
        <View style={styles.container}>
          <Content list={list} />
        </View>
      </Page>
    </Document>
  );
};

ExportPDFView.propTypes = {
  list: PropTypes.object
};

export default ExportPDFView;
