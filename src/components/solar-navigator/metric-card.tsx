'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LucideProps } from 'lucide-react';
import React from 'react';

interface MetricCardProps {
  icon: React.ElementType<LucideProps>;
  label: string;
  value: string | number;
  description: string;
}

export default function MetricCard({ icon: Icon, label, value, description }: MetricCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
