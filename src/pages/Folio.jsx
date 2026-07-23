import React from 'react';
import FolioContainer from '../components/Folio/FolioContainer';
import { FolioProvider } from '../context/FolioContext';

const Folio = () => {
  return (
    <FolioProvider>
      <FolioContainer />
    </FolioProvider>
  );
};

export default Folio;
