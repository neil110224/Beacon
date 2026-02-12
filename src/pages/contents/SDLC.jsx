import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 15,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function ExcelImportTable() {
  const [tableData, setTableData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map the data to match your table structure
        const formattedData = jsonData.map((row, index) => ({
          id: index + 1,
          systemName: row['System Name'] || row['system_name'] || '',
          phaseModule: row['Phase/Module'] || row['phase_module'] || '',
          description: row['Description/Task'] || row['description'] || '',
          raisedDate: row['Raised Date'] || row['raised_date'] || '',
          startDate: row['Start Date'] || row['start_date'] || '',
          endDate: row['End Date'] || row['end_date'] || '',
          updatedAt: row['Updated at'] || row['updated_at'] || '',
          status: row['Status'] || row['status'] || '',
          category: row['Category'] || row['category'] || '',
          remarks: row['Remarks'] || row['remarks'] || '',
        }));

        setTableData(formattedData);
        console.log('Imported data:', formattedData);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading Excel file. Please make sure it is a valid Excel file.');
      }
    };

    reader.readAsArrayBuffer(file);
    
    // Reset input so the same file can be uploaded again
    event.target.value = '';
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    
    // Handle Excel date serial numbers
    if (typeof dateValue === 'number') {
      const date = XLSX.SSF.parse_date_code(dateValue);
      return `${date.m}/${date.d}/${date.y}`;
    }
    
    return dateValue;
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
        >
          Import Excel
          <VisuallyHiddenInput
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
        </Button>
        
        {tableData.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => setTableData([])}
          >
            Clear Data ({tableData.length} rows)
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead sx={{ bgcolor: '#dadada' }}>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>System Name</StyledTableCell>
              <StyledTableCell>Phase/Module</StyledTableCell>
              <StyledTableCell>Description/Task</StyledTableCell>
              <StyledTableCell>Raised Date</StyledTableCell>
              <StyledTableCell>Start Date</StyledTableCell>
              <StyledTableCell>End Date</StyledTableCell>
              <StyledTableCell>Updated at</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Category</StyledTableCell>
              <StyledTableCell>Remarks</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={11} align="center">
                  No data. Please import an Excel file.
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              tableData.map((row) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>{row.id}</StyledTableCell>
                  <StyledTableCell>{row.systemName || '-'}</StyledTableCell>
                  <StyledTableCell>{row.phaseModule || '-'}</StyledTableCell>
                  <StyledTableCell>{row.description || '-'}</StyledTableCell>
                  <StyledTableCell>{formatDate(row.raisedDate)}</StyledTableCell>
                  <StyledTableCell>{formatDate(row.startDate)}</StyledTableCell>
                  <StyledTableCell>{formatDate(row.endDate)}</StyledTableCell>
                  <StyledTableCell>{formatDate(row.updatedAt)}</StyledTableCell>
                  <StyledTableCell>{row.status || '-'}</StyledTableCell>
                  <StyledTableCell>{row.category || '-'}</StyledTableCell>
                  <StyledTableCell>{row.remarks || '-'}</StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}