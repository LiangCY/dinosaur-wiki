import React from 'react';
import { useParams } from 'react-router-dom';
import DinosaurDetail from './DinosaurDetail';

const DinosaurDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const handleBackToList = () => {
    window.history.back();
  };

  return (
    <DinosaurDetail
      dinosaurId={id || ''}
      onBack={handleBackToList}
    />
  );
};

export default DinosaurDetailPage;