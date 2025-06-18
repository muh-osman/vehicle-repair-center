import style from "./scan.module.scss";
// QR Code npm
import { QrReader } from "react-qr-reader";
// React
import { useEffect, useState } from "react";
//
import { useNavigate } from "react-router-dom";
// MUI
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
// import Autocomplete from "@mui/material/Autocomplete";
// Axios
import axios from "axios";
//
import { toast } from "react-toastify";
// Api
const apiUrl = process.env.REACT_APP_PAYMENY_SYSTEM_API_URL;

export default function Scan() {
  // qr Scan Sound Effect.
  const qrScanSoundEffect = new Audio(
    "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
  );

  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const scanUserId = async () => {
    qrScanSoundEffect.play(); // Sound
    try {
      if (scanResult.startsWith("free-")) {
        // Free Order
        const trimmedFreeOrderScanResult = scanResult.replace(/^free-/, "");
        navigate(`/dashboard/free-order-result/${trimmedFreeOrderScanResult}`);
      } else if (scanResult.length === 14) {
        // UnPaid user
        navigate(`/dashboard/unpaid-client/${scanResult}`);
      } else if (scanResult.startsWith("tamara")) {
        // Tamara payment
        const trimmedScanResult = scanResult.replace(/^tamara/, ""); // Remove "tamara" from the beginning of scanResult
        navigate(`/dashboard/tamara-client/${trimmedScanResult}`);
      } else if (scanResult.startsWith("tabby")) {
        // Tabby payment
        const trimmedTabbyScanResult = scanResult.replace(/^tabby/, ""); // Remove "tabby" from the beginning of scanResult
        navigate(`/dashboard/tabby-client/${trimmedTabbyScanResult}`);
      } else {
        // Moyasar payment
        navigate(`/dashboard/paid-client/${scanResult}`);
      }
    } catch (err) {
      console.log(err);
      setError(err);
    }
  };

  useEffect(() => {
    if (scanResult) {
      scanUserId();
    }
  }, [scanResult]);

  // Fetch phone numbers from API
  const [phoneNumbersData, setPhoneNumbersData] = useState([]);
  const [loadding, setLoadding] = useState(false);

  const fetchPhoneNumbers = async () => {
    try {
      setLoadding(true);

      const response = await axios.get(
        `${apiUrl}api/get-all-phones-with-their-qr-codes`
      );

      // console.log(response.data);
      setPhoneNumbersData(response.data);

      setLoadding(false);
    } catch (err) {
      console.log(err);
      setLoadding(false);
    }
  };

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  // const handleSelecteChange = (event, value) => {
  //   if (value) {
  //     setScanResult(value.qr_code);
  //   }
  // };

  //
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Replace any non-digit character with empty string
    const englishNumbersOnly = value.replace(/[^0-9]/g, "");
    setInputValue(englishNumbersOnly);
  };

  const handleSubmit = () => {
    setIsLoading(true);

    // Normalize the input value by removing leading 0 if exists
    const normalizedInput = inputValue.replace(/^0+/, "");

    // Find all matching phones (ignoring leading 0s)
    const matchingPhones = phoneNumbersData.filter((item) => {
      const normalizedPhone = item.phone.replace(/^0+/, "");
      return normalizedPhone === normalizedInput;
    });

    if (matchingPhones.length === 1) {
      // Get the last matching phone as requested
      const lastMatchingPhone = matchingPhones[matchingPhones.length - 1];
      setScanResult(lastMatchingPhone.qr_code);
      setError(null);
    } else if (matchingPhones.length > 1) {
      // Get the last matching phone as requested
      // toast.warn("رقم جوال مكرر, يفضل استخدام الباركود");
      const lastMatchingPhone = matchingPhones[matchingPhones.length - 1];
      setScanResult(lastMatchingPhone.qr_code);
      setError(null);
    } else {
      setError("No matching phone number found");
      toast.warn("No matching phone number found");
    }

    setIsLoading(false);
  };

  return (
    <div className={style.container}>
      <div className={style.qr_box}>
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              setScanResult(result?.text);
              setError(null); // Clear error if there's a valid result
            }
            if (!!error) {
              console.info(error);
              setError(error.message);
            }
          }}
          style={{ width: "100%", height: "100%" }}
          constraints={{ facingMode: "environment" }}
        />

        {/* <pre>{scanResult && scanResult}</pre> */}

        <TextField
          label="Phone Number"
          placeholder="05XXXXXXXX"
          variant="outlined"
          sx={{ width: "100%", marginTop: "32px", backgroundColor: "white" }}
          onChange={handleInputChange}
          value={inputValue}
          type="tel"
          inputProps={{
            minLength: 10,
            maxLength: 10,
          }}
        />

        <LoadingButton
          variant="contained"
          onClick={handleSubmit}
          loading={isLoading}
          disabled={inputValue.length < 10}
          fullWidth
          size="large"
          sx={{ marginTop: "16px" }}
        >
          Search
        </LoadingButton>

        {/* Fetch error */}
        {error && (
          <pre style={{ color: "red", overflow: "hidden" }}>{error}</pre>
        )}
      </div>
    </div>
  );
}
