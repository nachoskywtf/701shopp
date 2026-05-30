import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { DashboardHome } from '../components/manager/DashboardHome';

export const Route = createFileRoute('/701manager/')({
  component: DashboardHome,
});
