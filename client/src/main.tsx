import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import axiosInstance from './lib/axiosInstance'

// Fetch CSRF token once on app load — sets XSRF-TOKEN cookie
axiosInstance.get('/api/auth/csrf').catch(() => {
    console.error('Failed to fetch CSRF token')
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      {/*enveloppe l'application dans le ChakraProvider pour que le thème soit accessible dans tous les composants de l'application*/}
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>    
  </React.StrictMode>
);