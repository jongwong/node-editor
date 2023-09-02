import React from 'react';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter } from 'react-router-dom';

import routes from '@/routes';

import './index.css';

const App: React.FC = () => <BrowserRouter>{renderRoutes(routes)}</BrowserRouter>;

export default App;
