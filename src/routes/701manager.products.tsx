import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ProductsManager } from '../components/manager/ProductsManager';

export const Route = createFileRoute('/701manager/products')({
  component: ProductsManager,
});
