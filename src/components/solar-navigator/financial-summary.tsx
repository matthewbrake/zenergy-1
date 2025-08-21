'use client';

import { useState } from 'react';
import { type SolarPotentialAssessmentOutput } from '@/ai/flows/solar-potential-assessment';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Zap } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';


interface FinancialSummaryProps {
  financialAnalysis: SolarPotentialAssessmentOutput['financialAnalysis'];
  yearlyEnergyDcKwh: number;
}

// Constants from the proposal
const DC_TO_AC_DERATE = 0.85;
const EFFICIENCY_DEPRECIATION_RATE = 0.005;
const PANEL_LIFETIME_YEARS = 20;

export default function FinancialSummary({ financialAnalysis, yearlyEnergyDcKwh }: FinancialSummaryProps) {
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [utilityRate, setUtilityRate] = useState(0.18); // National average placeholder
  
  const annualEnergyAcKwh = yearlyEnergyDcKwh * DC_TO_AC_DERATE;
  
  const lifetimeProduction = Array.from({ length: PANEL_LIFETIME_YEARS }).reduce((acc, _, i) => {
    return acc + (annualEnergyAcKwh * Math.pow(1 - EFFICIENCY_DEPRECIATION_RATE, i));
  }, 0);

  const annualConsumption = (monthlyBill / utilityRate) * 12;
  const lifetimeSavings = lifetimeProduction * utilityRate;

  const costWithPanels = financialAnalysis?.cashPurchaseSavings.outOfPocketCost || 0;

  return (
    <div className="space-y-8 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Savings Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <Label htmlFor="monthly-bill">Average Monthly Electric Bill: ${monthlyBill}</Label>
            <Slider
              id="monthly-bill"
              min={25}
              max={1000}
              step={5}
              value={[monthlyBill]}
              onValueChange={(value) => setMonthlyBill(value[0])}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utility-rate">Your Utility Rate ($/kWh)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="utility-rate"
                type="number"
                step="0.01"
                value={utilityRate}
                onChange={(e) => setUtilityRate(parseFloat(e.target.value) || 0)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">System & Savings Breakdown</h3>
        <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Estimated System Cost (Cash Purchase)</TableCell>
              <TableCell className="text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(costWithPanels)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Federal & State Incentives</TableCell>
              <TableCell className="text-right text-green-600">-{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financialAnalysis?.cashPurchaseSavings.rebateValue || 0)}</TableCell>
            </TableRow>
            <TableRow className="bg-muted/50">
              <TableCell className="font-bold">Net System Cost</TableCell>
              <TableCell className="text-right font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financialAnalysis?.cashPurchaseSavings.upfrontCost || 0)}</TableCell>
            </TableRow>
             <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-amber-500"/> Lifetime Energy Production
                </div>
              </TableCell>
              <TableCell className="text-right">{Math.round(lifetimeProduction).toLocaleString()} kWh</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-green-600"/> Estimated Lifetime Savings
                </div>
              </TableCell>
              <TableCell className="text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lifetimeSavings)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Disclaimer: These are estimates. Actual savings may vary based on usage, weather, and utility rate changes. Does not account for soiling, snow, or other local factors.
        </p>
      </div>
    </div>
  );
}
