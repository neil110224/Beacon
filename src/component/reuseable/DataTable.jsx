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
} from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";

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
  columns,
  rows = [],  // Default to empty array to prevent undefined.slice error
  totalCount,
  isLoading,
  isError,
  error,
  tableSx = { minWidth: 1400 },
  headSx = { bgcolor: "#dadada" },
}) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3, color: "error.main" }}>
        Error: {error?.data?.message || error || "Failed to load data"}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={tableSx}>
        <TableHead sx={headSx}>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align || "left"}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                {rows.length === 0 ? "No data available" : "No data on this page"}
              </TableCell>
            </TableRow>
          ) : (
            paginatedRows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align || "left"}>
                    {col.render ? col.render(row) : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              colSpan={columns.length}
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
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
  ).isRequired,
  rows: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.any,
  tableSx: PropTypes.object,
  headSx: PropTypes.object,
};

export default DataTable;