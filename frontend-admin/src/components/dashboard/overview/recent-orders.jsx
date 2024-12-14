import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import dayjs from "dayjs";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTheme } from "@mui/material";

const statusMap = {
  pending: { label: "Pending", color: "warning" },
  Shipped: { label: "Shipped", color: "success" },
  refunded: { label: "Refunded", color: "error" },
};

export function RecentOrders({ orders = [], sx }) {
  const theme = useTheme();
  const bg = theme.palette.custom.tableHeaderBg;
  const text = theme.palette.custom.tableHeaderText;

  return (
    <Card sx={sx}>
      <CardHeader title="Recent orders" />
      <Divider />
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: bg, 
                '& > th': { color: text },
              }}
            >
              <TableCell align="center" ></TableCell>
              <TableCell align="center" sx={{fontSize:'16px' }}>Product</TableCell>
              <TableCell align="center" sortDirection="desc" sx={{fontSize:'16px'}}>Date</TableCell>
              <TableCell align="center" sx={{fontSize:'16px'}}>Order</TableCell>
              <TableCell align="center" sx={{fontSize:'16px'}}>Status</TableCell>
              <TableCell align="center" sx={{fontSize:'16px'}}>Amount</TableCell>
              <TableCell align="center" sx={{fontSize:'16px'}}></TableCell>
             </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const { label, color } = statusMap[order.status] ?? {
                label: "Unknown",
                color: "default",
              };

              return (
                <TableRow hover key={order.order}>
                  <TableCell>
                    <img
                      src={order.a}
                      alt={order.product}
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                  </TableCell>

                  <TableCell align="center" sx={{fontSize:'18px'}}>{order.product}</TableCell>
                  <TableCell align="center" sx={{fontSize:'18px'}}>
                    {dayjs(order.createdAt).format("DD MMM, YYYY")}
                  </TableCell>
                  <TableCell align="center" sx={{fontSize:'18px'}}>
                    {order.order}
                  </TableCell>
                  <TableCell align="center" sx={{fontSize:'18px'}}>
                    <Chip color={color} label={label} size="small" />
                  </TableCell>
                  <TableCell align="center" sx={{fontSize:'18px'}}>{order.amount}</TableCell>
                  <TableCell>
                    <a href={order.link} target="_blank" rel="noopener noreferrer">
                      <Button>
                        <OpenInNewIcon 
                          sx={{
                            color: theme.palette.custom.openInNewIcon
                          }} 
                        />
                      </Button>
                    </a>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          View all
        </Button>
      </CardActions>
    </Card>
  );
}
