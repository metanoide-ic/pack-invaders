import './style.css';
import { App } from './ui/App';

const root = document.getElementById('app');
if (!root) throw new Error('Elemento #app não encontrado');

new App(root);
