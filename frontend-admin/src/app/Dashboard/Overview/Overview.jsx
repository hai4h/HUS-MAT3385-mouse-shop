import React from 'react';
import dayjs from 'dayjs';
import './pages.css'; 
import {Revenue} from '../../../components/dashboard/overview/Revenue';
import {RecentOrders} from '../../../components/dashboard/overview/recent-orders';
import {Orders} from '../../../components/dashboard/overview/Orders';
import {AverageValue} from '../../../components/dashboard/overview/average-value';

export default function Overview() {
  
  return (
    <div className="page-container">
      <div className="tit">
        <h1 >Hello, Admin</h1>
        <h2>Here a brief summary</h2>
      </div>
      <h1>Overview</h1>

      {/* Các thành phần chính */}
      <div className="container">
        <div className="item">
          <Revenue sx={{ height: '100%' }} value={420.69} />
        </div>
        <div className="item">
          <Orders sx={{ height: '100%' }} value={1600} />
        </div>
        <div className="item">
          <AverageValue sx={{ height: '100%' }} value={75.5} />
        </div>

        {/* Recent Orders */}
        <div className="item" style={{ width: '100%' }}>
          <RecentOrders
            orders={[
              { 
                a:'./product.png',
                product: "Logitech G pro  superlight X",
                createdAt: dayjs().subtract(10, 'minutes').toDate(),
                order: 'ORD-007',
                amount: 30.5,
                status: 'Shipped',
                link: 'https://memoryzone.com.vn/chuot-khong-day-gaming-logitech-g-pro-x-superlight?variantid=96183614',
              },
              {
                a:'./product.png',
                product: "Logitech G pro  superlight X",
                createdAt: dayjs().subtract(10, 'minutes').toDate(),
                order: 'ORD-007',
                amount: 30.5,
                status: 'Shipped',
                link: 'https://memoryzone.com.vn/chuot-khong-day-gaming-logitech-g-pro-x-superlight?variantid=96183614',
              },
              {
                a:'./product.png',
                product: "Logitech G pro  superlight X",
                createdAt: dayjs().subtract(10, 'minutes').toDate(),
                order: 'ORD-007',
                amount: 30.5,
                status: 'Shipped',
                link: 'https://memoryzone.com.vn/chuot-khong-day-gaming-logitech-g-pro-x-superlight?variantid=96183614',
              },
              {
                a:'./product.png',
                product: "Logitech G pro  superlight X",
                createdAt: dayjs().subtract(10, 'minutes').toDate(),
                order: 'ORD-007',
                amount: 30.5,
                status: 'Shipped',
                link: 'https://memoryzone.com.vn/chuot-khong-day-gaming-logitech-g-pro-x-superlight?variantid=96183614',
              },
              {
                a:'./product.png',
                product: "Logitech G pro  superlight X",
                createdAt: dayjs().subtract(10, 'minutes').toDate(),
                order: 'ORD-007',
                amount: 30.5,
                status: 'Shipped',
                link: 'https://memoryzone.com.vn/chuot-khong-day-gaming-logitech-g-pro-x-superlight?variantid=96183614',
              },
              {
                a:'./product.png',
                product: "Logitech G pro  superlight X",
                createdAt: dayjs().subtract(10, 'minutes').toDate(),
                order: 'ORD-007',
                amount: 30.5,
                status: 'Shipped',
                link: 'https://memoryzone.com.vn/chuot-khong-day-gaming-logitech-g-pro-x-superlight?variantid=96183614',
              },
            ]}
            sx={{ height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
