import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ManagerLayout } from '../components/manager/ManagerLayout';

export const Route = createFileRoute('/701manager')({
  component: ManagerPage,
});

function ManagerPage() {
  return <ManagerLayout />;
}
