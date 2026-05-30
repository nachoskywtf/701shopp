import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { AnalyticsCFO } from '../components/manager/AnalyticsCFO';

export const Route = createFileRoute('/701manager/analytics')({
  component: AnalyticsCFO,
});
