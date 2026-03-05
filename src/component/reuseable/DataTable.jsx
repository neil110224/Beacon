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
import "./reuseablescss/DataTable.scss";

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  return (
    <Box className="paginationActionsWrapper">
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
  cellTextColor = "#03346E",
  tableSx = { minWidth: 1400 },
  headSx = { bgcolor: "#dadada" },
}) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Prevent slice crash if rows is undefined
  const safeRows = Array.isArray(rows) ? rows : [];

  const paginatedRows = safeRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box className="dataTableLoading">
        <CircularProgress />
      </Box>
    );
  }

  // Check if error is 404 (no records found) - treat as empty state
  const isNotFoundError = error?.status === 404 || error?.data?.errors?.[0]?.status === 404;
  
  if (isError && !isNotFoundError && error) {
    return (
      <Box className="dataTableError">
        Error: {error?.data?.message || error?.error || "Failed to load data"}
      </Box>
    );
  }

  // If 404 or no rows, show empty state
  if (isNotFoundError || safeRows.length === 0) {
    return (
      <Paper 
        elevation={0}
        className="dataTablePaperEmpty"
      >
        <Box className="emptyStateContainer">
          <InboxIcon className="emptyStateIcon" />
          <Typography variant="h6" color="text.secondary" className="emptyStateTitle">
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
      className="dataTablePaper"
      sx={{ display: "flex", flexDirection: "column", maxHeight: "400px" }}
    >
      <TableContainer className="dataTableContainer" sx={{ overflow: "auto", flex: 1 }}>
        <Table className="dataTableBase">
          <TableHead className="dataTableHead" sx={{ position: "sticky", top: 0, zIndex: 1 }}>
            <TableRow>
              {columns.length === 0 ? (
                <TableCell align="center">No Columns Defined</TableCell>
              ) : (
                columns.map((col) => (
                  <TableCell 
                    key={col.id} 
                    align={col.align || "left"} 
                    className="dataTableHeaderCell" 
                    title={col.label}
                    sx={{ 
                      width: col.width, 
                      maxWidth: "200px",
                      fontSize: "1.3rem", 
                      color: "#03346E", 
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "help"
                    }}
                  >
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
                  className="dataTableEmptyCell"
                >
                  <Box className="emptyDataBox">
                    <InboxIcon className="emptyDataIcon" />
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
                  className="dataTableRow"
                >
                  {columns.map((col) => (
                    <TableCell 
                      key={col.id} 
                      align={col.align || "left"} 
                      className="dataTableBodyCell" 
                      sx={{ 
                        width: col.width, 
                        maxWidth: "200px",
                        color: cellTextColor,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
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
        rowsPerPageOptions={[10,20, 30, 50]}
        count={totalCount || safeRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        ActionsComponent={TablePaginationActions}
        sx={{ color: "#03346E" }}
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
  cellTextColor: PropTypes.string,
};

export default DataTable;
