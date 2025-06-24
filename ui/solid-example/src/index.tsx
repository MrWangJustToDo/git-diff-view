// import 'solid-devtools'
/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import "@git-diff-view/solid/styles/diff-view.css"
import App from './App.tsx'

const root = document.getElementById('root')

render(() => <App />, root!)
