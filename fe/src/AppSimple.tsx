import React from 'react';
import { ConfigProvider } from 'antd';
import enUS from 'antd/es/locale/en_US';
import AppRouter from './router';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={enUS}>
      <AppRouter />
    </ConfigProvider>
  );
};

export default App;
