import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Typography,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import createCache from "@emotion/cache";

const utilizationOptions = [55, 50, 40, 35, 30, 20];

// פונקציה לפורמט מספר עם פסיקים ו-2 ספרות אחרי הנקודה
function formatNumber(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// יצירת Cache RTL
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: "rtl",
});

export default function LoanCalculator() {
  const [commission, setCommission] = useState("1.00");
  const [ltvMax, setLtvMax] = useState("70.00");
  const [projectCost, setProjectCost] = useState("0.00");
  const [inventoryValue, setInventoryValue] = useState("0.00");
  const [maxCreditLimit, setMaxCreditLimit] = useState("0.00");
  const [primeRate, setPrimeRate] = useState("6.00");
  const [margin, setMargin] = useState("2.70");
  const [totalInterestRate, setTotalInterestRate] = useState("8.70");
  const [selectedUtilization, setSelectedUtilization] = useState(55);
  const [utilizationAmount, setUtilizationAmount] = useState("0.00");

  // חישוב מסגרת אשראי
  useEffect(() => {
    const ltv = parseFloat(ltvMax.replace(/,/g, "")) || 0;
    const cost = parseFloat(projectCost.replace(/,/g, "")) || 0;
    const calculated = (ltv / 100) * cost;
    setMaxCreditLimit(formatNumber(calculated));
  }, [ltvMax, projectCost]);

  // חישוב ריבית כוללת
  useEffect(() => {
    const p = parseFloat(primeRate.replace(/,/g, "")) || 0;
    const m = parseFloat(margin.replace(/,/g, "")) || 0;
    setTotalInterestRate(formatNumber(p + m));
  }, [primeRate, margin]);

  // חישוב ניצול בפועל
  useEffect(() => {
    const credit = parseFloat(maxCreditLimit.replace(/,/g, "")) || 0;
    const amount = (selectedUtilization / 100) * credit;
    setUtilizationAmount(formatNumber(amount));
  }, [selectedUtilization, maxCreditLimit]);

  // פונקציה לשינוי ערכים
  function handleChange(
    setter: React.Dispatch<React.SetStateAction<string>>
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = e.target.value.replace(/,/g, "");
      if (!isNaN(Number(cleaned)) || cleaned === "") {
        setter(cleaned);
      }
    };
  }

  // יצירת TextField עם יישור ותצוגה RTL
  const renderNumberField = (
    label: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    suffix: string = ""
  ) => (
    <TextField
      fullWidth
      label={suffix=== '%' ?`%${label}` :label }
      value={value}
      onChange={handleChange(setter)}
      InputProps={{
        style: { direction: "rtl", textAlign: "right" },
        endAdornment: suffix ==='₪' ? <span>{suffix}</span> : null,
      }}
      inputProps={{ inputMode: "decimal" }}
      sx={{ "& label": { textAlign: "left", width: "100%" } }}
    />
  );

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Box p={3}>
          <Paper elevation={3} sx={{ p: 3, maxWidth: 700, margin: "auto" }}>
            <Typography variant="h5" gutterBottom align="center">
              חישובית מיטב מימון
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderNumberField("עמלת הקמה", commission, setCommission, "%")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderNumberField("LTV MAX", ltvMax, setLtvMax, "%")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderNumberField("עלות הקמה פרויקט כולל מע\"מ", projectCost, setProjectCost, "₪")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderNumberField("שווי מלאי פרויקט", inventoryValue, setInventoryValue, "₪")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderNumberField("מסגרת אשראי מקסימלית", maxCreditLimit, setMaxCreditLimit, "₪")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderNumberField("שיעור פריים", primeRate, setPrimeRate, "%")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderNumberField("מרווח", margin, setMargin, "%")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderNumberField("ריבית כוללת", totalInterestRate, setTotalInterestRate, "%")}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="ניצול אשראי"
                  value={selectedUtilization}
                  onChange={(e) => setSelectedUtilization(Number(e.target.value))}
                  sx={{ "& label": { textAlign: "left", width: "100%" } }}
                >
                  {utilizationOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}%
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" align="center" sx={{ mt: 2 }}>
                  סכום ניצול בפועל: ₪{utilizationAmount}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
