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

const ExportPDFView = ({ data, logo }) => {
  let title = data?.invoiceNumber;
  let customer_name = data?.billedTo?.name;

  return (
    <Document title={`${title} ${customer_name}`}>
      <Page size="A4" style={styles.page}>
        <Header data={data} logo={logo} />
        <View style={styles.container}>
          <Content data={data} />
        </View>
      </Page>
    </Document>
  );
};

ExportPDFView.propTypes = {
  list: PropTypes.object
};

export default ExportPDFView;
