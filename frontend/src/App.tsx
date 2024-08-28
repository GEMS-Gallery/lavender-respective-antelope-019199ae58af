import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Paper, Grid, Button, Typography, CircularProgress } from '@mui/material';
import { backend } from 'declarations/backend';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
    },
    secondary: {
      main: '#f8f9fa',
    },
  },
});

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = async (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      setLoading(true);
      try {
        const result = await backend.calculate(operator, firstOperand, inputValue);
        setDisplay(result.toString());
        setFirstOperand(result);
      } catch (error) {
        setDisplay('Error');
      } finally {
        setLoading(false);
      }
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
          <Typography variant="h4" align="right" sx={{ p: 2, minHeight: '64px' }}>
            {loading ? <CircularProgress size={24} /> : display}
          </Typography>
          <Grid container spacing={1}>
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
              <Grid item xs={3} key={btn}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    if (btn === '=') {
                      performOperation('=');
                    } else if (['+', '-', '*', '/'].includes(btn)) {
                      performOperation(btn);
                    } else if (btn === '.') {
                      inputDecimal();
                    } else {
                      inputDigit(btn);
                    }
                  }}
                  sx={{
                    bgcolor: btn === '=' ? '#28a745' : (theme) => theme.palette.secondary.main,
                    color: btn === '=' ? 'white' : 'black',
                    '&:hover': {
                      bgcolor: btn === '=' ? '#218838' : (theme) => theme.palette.secondary.dark,
                    },
                  }}
                >
                  {btn}
                </Button>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button variant="outlined" fullWidth onClick={clear}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default App;