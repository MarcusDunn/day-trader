import React, { useState, useEffect } from "react";
import { visuallyHidden } from "@mui/utils";
import { Button, InputAdornment, TextField, Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Toolbar, Typography, Paper } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Stock",
  },
  {
    id: "change",
    numeric: true,
    disablePadding: false,
    label: "Net Change ($)",
  },
  {
    id: "percentChange",
    numeric: true,
    disablePadding: false,
    label: "Net Change (%)",
  },
  {
    id: "price",
    numeric: true,
    disablePadding: false,
    label: "Price ($)",
  },
  {
    id: "view",
    numeric: true,
    disablePadding: false,
    label: "View",
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function StockOptions({ largeView }) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("change_perc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rawStocks, setRawStocks] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    const populatePage = async () => {
      await getStocks();
    };
    populatePage();
    if(largeView){
      setRowsPerPage(10)
    }
  }, []);

  const getStocks = async () => {
    try {
      const response = await (await fetch("/api/stocks")).json();
      setRawStocks(response);
      setStocks(response);
      setSearchString("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    const includedStocks = [];
    const searchValue = event.target.value;
    setSearchString(searchValue);
    for(const stock of rawStocks){
      stock.name.toLowerCase().includes(searchValue.toLowerCase()) ? includedStocks.push(stock) : null
    }
    setStocks(includedStocks);
  }

  // Avoid a layout jump when reaching the last page with empty stocks.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - stocks.length) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper className="p-4" sx={{borderRadius: 3}}>
        <Toolbar className="flex flex-row justify-between">
          <Typography variant="h6" id="tableTitle" component="div">
            Stocks
          </Typography>
          <TextField
            variant="standard"
            value={searchString}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Toolbar>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="small"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={stocks.length}
            />
            <TableBody>
              {stocks
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow hover tabIndex={-1} key={row.name}>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                        className="font-medium"
                      >
                        {row.name}
                      </TableCell>
                      <TableCell 
                        align="right" 
                        className={ row.change > 0 ? "text-green-500" : "text-red-500"}
                        >
                        ${row.change.toFixed(2)}
                      </TableCell>
                      <TableCell 
                        align="right" 
                        className={ row.percentChange > 0 ? "text-green-500" : "text-red-500"}
                        >
                        {row.percentChange.toFixed(2)}%
                      </TableCell>
                      <TableCell align="right">
                        ${row.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <Button variant="outlined" href={"/stocks/".concat(row.name)}>View</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 33 * emptyRows,
                  }}
                >
                  <TableCell colSpan={5} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={stocks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
