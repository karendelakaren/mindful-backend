import React, {useState, useEffect} from 'react';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import Container from "@material-ui/core/Container";
import DateFnsUtils from '@date-io/date-fns';
import format from 'date-fns/format';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const Root = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #EEEEEE;
  padding: 50px 20px;
  box-sizing: border-box;
`;

const StyledPaper = styled(Paper)`
  margin-bottom: 20px;
  padding: 20px;
`;

const InputContainer = styled.div`
  margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
`;

const ActionsContainer = styled.div`
  text-align: right;
  button {
    margin-left: 10px;
  }
`;

const formatDate = (selectedDate) => format(selectedDate, 'yyyy-MM-dd');
const sortCues = (cues) => cues.sort((a,b) => {
  return new Date(a.selectedDate) - new Date(b.selectedDate);
});

function App() {
  const [selectedDate, handleDateChange] = useState(new Date());
  const [shortTitle, handleShortTitleChange] = useState('');
  const [title, handleTitleChange] = useState('');
  const [description, handleDescriptionChange] = useState('');

  const [cuesList, setCuesList] = useState([]);

  const [open, setOpen] = React.useState(false);

  const openDialog = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const resetValues = () => {
    handleDateChange(new Date());
    handleShortTitleChange('');
    handleTitleChange('');
    handleDescriptionChange('');
  }

  useEffect(() => {
    const callCues = async () => {
      const res = await fetch('http://localhost:4000/');
      const cues = await res.json();
      setCuesList(cues);

    }
    callCues();


  }, [])

  const saveCue = () => {
    const cues = [
      ...cuesList,
      {
        formattedDate: formatDate(selectedDate),
        selectedDate: selectedDate.toString(),
        shortTitle,
        title,
        description,
      }
    ];

    sortCues(cues);

    setCuesList(cues);
    resetValues();
  }

  const handleSubmit = () => {
    const existingDate = cuesList.findIndex(item => item.formattedDate === formatDate(selectedDate))

    if (existingDate !== -1) {
      openDialog()
    } else {
      saveCue();
    }
  }

  const overwriteCue = () => {
    const existingDate = cuesList.findIndex(item => item.formattedDate === formatDate(selectedDate))

    setCuesList(cues => {
      cues[existingDate] = {
        formattedDate: formatDate(selectedDate),
        selectedDate: selectedDate.toString(),
        shortTitle,
        title,
        description,
      }

      sortCues(cues);

      return cues;
    })


    resetValues();
    handleClose();
  }

  const handleCreateJSON = async () => {
    const test = await fetch('http://localhost:4000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cuesList)
    })
    console.log(await test.text());
  };

  return (
    <Root>
      <Container maxWidth="md">
        <StyledPaper>
          <form>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <InputContainer>
              <KeyboardDatePicker
                value={selectedDate}
                onChange={handleDateChange}
                format="dd/MM/yyyy"
              />
            </InputContainer>
          </MuiPickersUtilsProvider>
            <InputContainer>
              <TextField
                label="Short title"
                fullWidth
                value={shortTitle}
                onChange={(evt) => handleShortTitleChange(evt.target.value)}
              />
            </InputContainer>
            <InputContainer>
              <TextField
                label="Title"
                fullWidth
                value={title}
                onChange={(evt) => handleTitleChange(evt.target.value)}
              />
            </InputContainer>
            <InputContainer>
              <TextField
                label="Description"
                fullWidth
                multiline
                value={description}
                onChange={(evt) => handleDescriptionChange(evt.target.value)}
              />
            </InputContainer>
            <ButtonContainer>
              <Button
                variant="contained"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </ButtonContainer>
            <ButtonContainer>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateJSON}
              >
                Create JSON
              </Button>
            </ButtonContainer>
          </form>
        </StyledPaper>
        {cuesList.map((cue) => (
          <StyledPaper key={cue.formattedDate}>
            <Typography variant="body1">
              {cue.selectedDate}
            </Typography>
            <Typography variant="h5">
              {cue.shortTitle}
            </Typography>
            <Typography variant="h6">
              {cue.title}
            </Typography>
            <Typography variant="body1">
              {cue.description}
            </Typography>
            <ActionsContainer>
              <Button
                color="primary"
                onClick={() => {
                  handleDateChange(new Date(cue.selectedDate));
                  handleShortTitleChange(cue.shortTitle);
                  handleTitleChange(cue.title);
                  handleDescriptionChange(cue.description);
                }}
              >
                Edit
              </Button>
              <Button
                color="secondary"
                onClick={() => {
                  const filteredList = cuesList.filter(item => item.selectedDate !== cue.selectedDate)
                  setCuesList(filteredList)
                }}
              >
                Delete
              </Button>
            </ActionsContainer>
          </StyledPaper>
        ))}

      </Container>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Are you sure about the date</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            An entry with the same date already exists and this will overwrite the previous entry.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={overwriteCue} color="primary" autoFocus>
            Overwrite
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
}

export default App;
