import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { OrdersManager } from '../components/manager/OrdersManager';

export const Route = createFileRoute('/701manager/orders')({
  component: OrdersManager,
});
