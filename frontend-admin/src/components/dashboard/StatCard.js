import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, icon, change }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h4 className="text-2xl font-bold mt-2">{value}</h4>
      </div>
      {icon}
    </div>
    <div className={`flex items-center mt-4 ${
      change >= 0 ? 'text-green-500' : 'text-red-500'
    }`}>
      {change >= 0 ? (
        <ArrowUp className="w-4 h-4" />
      ) : (
        <ArrowDown className="w-4 h-4" />
      )}
      <span className="ml-1 text-sm">
        {Math.abs(change)}% so với tháng trước
      </span>
    </div>
  </div>
);

export default StatCard;