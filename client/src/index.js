import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';

(function bootstrap() {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  axios.defaults.headers.common.Accept = 'application/json';
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  axios.defaults.withCredentials = true;
})();

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
