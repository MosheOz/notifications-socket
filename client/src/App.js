import React, { useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { transformText } from "./transform-text.util";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ENDPOINT = "http://127.0.0.1:4001";

function App() {
  const [response, setResponse] = useState("");
  const [open, setOpen] = useState(false);

  let socket = useRef(null);

  const handleClick = () => {
    socket.current.emit("clicked", response?.id);
    setOpen(false);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    socket.current = socketIOClient(ENDPOINT);
    socket.current.on("alertData", (data) => {
      setResponse({ ...data, text: transformText(data.text) });
      setOpen(true);
    });
  }, []);

  const alertToDisplay = response ? (
    <Snackbar
      onClick={() => {
        handleClick(response);
      }}
      open={open}
      autoHideDuration={Math.floor(Math.random() * (5 - 1) + 1) * 1000}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Alert
        onClose={handleClose}
        severity={response?.type}
        sx={{ width: "100%" }}
      >
        {response?.text}
      </Alert>
    </Snackbar>
  ) : (
    ""
  );

  return alertToDisplay;
}

export default App;
