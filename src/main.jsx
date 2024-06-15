import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SWRConfig } from "swr";
import { fetcherClient } from "./libs/api/axios-client";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

    <SWRConfig
      value={{
        revalidateIfStale: false,
        revalidateOnFocus: false,
        fetcher: fetcherClient,
      }}
    >

      <BrowserRouter>
        <Routes>
          <Route
            element={
              <App />
            }
            path="/"
          />
          {/* <Route element={<PrivateRoute />} path="*" /> */}
        </Routes>
      </BrowserRouter>
    </SWRConfig>
  </React.StrictMode>,
)
