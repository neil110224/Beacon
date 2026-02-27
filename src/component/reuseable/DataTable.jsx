// DataTable.jsx (reusable component)
import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import InboxIcon from "@mui/icons-material/Inbox";

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={(e) => onPageChange(e, 0)}
        disabled={page === 0}
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>

      <IconButton
        onClick={(e) => onPageChange(e, page - 1)}
        disabled={page === 0}
      >
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>

      <IconButton
        onClick={(e) => onPageChange(e, page + 1)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
      >
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>

      <IconButton
        onClick={(e) =>
          onPageChange(e, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
        }
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

function DataTable({
  columns = [],          // ✅ default safe
  rows = [],             // ✅ default safe
  totalCount = 0,        // ✅ default safe
  isLoading = false,
  isError = false,
  error = null,
  tableSx = { minWidth: 1400 },
  headSx = { bgcolor: "#dadada" },
}) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Prevent slice crash if rows is undefined
  const safeRows = Array.isArray(rows) ? rows : [];

  const paginatedRows = safeRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if error is 404 (no records found) - treat as empty state
  const isNotFoundError = error?.status === 404 || error?.data?.errors?.[0]?.status === 404;
  
  if (isError && !isNotFoundError && error) {
    return (
      <Box sx={{ p: 3, color: "error.main" }}>
        Error: {error?.data?.message || error?.error || "Failed to load data"}
      </Box>
    );
  }

  // If 404 or no rows, show empty state
  if (isNotFoundError || safeRows.length === 0) {
    return (
      <Paper 
        elevation={0}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <InboxIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No records found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no records to display
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0}
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      <TableContainer>
        <Table sx={tableSx}>
          <TableHead sx={headSx}>
            <TableRow>
              {columns.length === 0 ? (
                <TableCell align="center">No Columns Defined</TableCell>
              ) : (
                columns.map((col) => (
                  <TableCell key={col.id} align={col.align || "left"} sx={{ width: col.width }}>
                    {col.label}
                  </TableCell>
                ))
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length || 1}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <InboxIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      {safeRows.length === 0
                        ? "No data available"
                        : "No data on this page"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => (
                <TableRow 
                  key={row.id || Math.random()}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      transition: 'background-color 0.2s ease',
                    },
                    '&:last-child td': {
                      borderBottom: 0,
                    },
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || "left"} sx={{ width: col.width }}>
                      {col.render ? col.render(row) : row[col.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        rowsPerPageOptions={[5, 10, 25]}
        count={totalCount || safeRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        ActionsComponent={TablePaginationActions}
      />
    </Paper>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.string,
      render: PropTypes.func,
    })
  ),
  rows: PropTypes.array,
  totalCount: PropTypes.number,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.any,
  tableSx: PropTypes.object,
  headSx: PropTypes.object,
};

export default DataTable;
