import { render } from "solid-js/web";

import './index.css';

import { App } from './components/App';

console.log('read if cute');

const root = document.getElementById('root');

render(() => <App />, root);
