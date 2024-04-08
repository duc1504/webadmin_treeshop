import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const chartRef = useRef();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get('https://api-treeshop.onrender.com/product');
        setProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    getProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      createChart();
    }
  }, [products]);

  const createChart = () => {
    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: products.map(product => product.name),
        datasets: [{
          label: 'Quantity',
          data: products.map(product => product.quantity),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.2,
          fill: false
        }]
      }
    });
  };

  return (
    <div>
      <h1>Product Quantity</h1>
      <canvas id="myChart" width="400" height="200"></canvas>
    </div>
  );
};

export default Dashboard;
