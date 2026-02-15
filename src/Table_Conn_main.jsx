import React from 'react'
import ReactDOM from 'react-dom/client'
import { Xwrapper } from 'react-xarrows'
import Table_Conn_App from './Table_Conn_App'
import './Table_Conn_styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Xwrapper>
      <Table_Conn_App />
    </Xwrapper>
  </React.StrictMode>,
)
