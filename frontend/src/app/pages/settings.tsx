import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';
import type { Currency } from '@/lib/types';
import { DollarSign, Percent, TrendingDown, Plug } from 'lucide-react';
import { GitHubConnectionCard } from '@/app/components/github-connection-card';

export function SettingsPage() {
  const rateSettings = useAppStore(state => state.rateSettings);
  const updateRateSettings = useAppStore(state => state.updateRateSettings);

  const [formData, setFormData] = useState({
    baseHourlyRate: rateSettings.baseHourlyRate.toString(),
    internalCostRate: rateSettings.internalCostRate?.toString() || '',
    targetMarginPct: rateSettings.targetMarginPct?.toString() || '',
    defaultCurrency: rateSettings.defaultCurrency
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    const baseRate = parseFloat(formData.baseHourlyRate);

    if (isNaN(baseRate) || baseRate <= 0) {
      toast.error('Please enter a valid base hourly rate');
      return;
    }

    updateRateSettings({
      baseHourlyRate: baseRate,
      internalCostRate: formData.internalCostRate ? parseFloat(formData.internalCostRate) : undefined,
      targetMarginPct: formData.targetMarginPct ? parseFloat(formData.targetMarginPct) : undefined,
      defaultCurrency: formData.defaultCurrency
    });

    setHasChanges(false);
    toast.success('Settings saved successfully');
  };

  const handleCancel = () => {
    setFormData({
      baseHourlyRate: rateSettings.baseHourlyRate.toString(),
      internalCostRate: rateSettings.internalCostRate?.toString() || '',
      targetMarginPct: rateSettings.targetMarginPct?.toString() || '',
      defaultCurrency: rateSettings.defaultCurrency
    });
    setHasChanges(false);
  };

  const calculatedRate = () => {
    const cost = parseFloat(formData.internalCostRate);
    const margin = parseFloat(formData.targetMarginPct);

    if (!isNaN(cost) && !isNaN(margin) && margin > 0) {
      return (cost / (1 - margin / 100)).toFixed(2);
    }
    return null;
  };

  const suggestedRate = calculatedRate();

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your billing rates and integrations
        </p>
      </div>

      <Tabs defaultValue="rates">
        <TabsList>
          <TabsTrigger value="rates">
            <DollarSign className="size-4 mr-1" />
            Rates
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="size-4 mr-1" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Rates Tab */}
        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Configuration</CardTitle>
              <CardDescription>
                Set your default hourly rates and margins for accurate project pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="baseRate" className="flex items-center gap-2">
                  <DollarSign className="size-4" />
                  Base Hourly Rate *
                </Label>
                <Input
                  id="baseRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.baseHourlyRate}
                  onChange={(e) => handleChange('baseHourlyRate', e.target.value)}
                  placeholder="150.00"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your default billable rate per hour. Can be overridden per project.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="costRate" className="flex items-center gap-2">
                  <TrendingDown className="size-4" />
                  Internal Cost Rate (Optional)
                </Label>
                <Input
                  id="costRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.internalCostRate}
                  onChange={(e) => handleChange('internalCostRate', e.target.value)}
                  placeholder="80.00"
                />
                <p className="text-xs text-muted-foreground">
                  Your internal cost per hour (salary, overhead, etc.). Used for margin calculations.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin" className="flex items-center gap-2">
                  <Percent className="size-4" />
                  Target Margin % (Optional)
                </Label>
                <Input
                  id="margin"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.targetMarginPct}
                  onChange={(e) => handleChange('targetMarginPct', e.target.value)}
                  placeholder="40"
                />
                <p className="text-xs text-muted-foreground">
                  Your target profit margin percentage. Helps calculate optimal rates.
                </p>
              </div>

              {suggestedRate && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Suggested Rate (based on cost + margin)</p>
                        <p className="text-xs text-muted-foreground">
                          Cost {formData.defaultCurrency} {formData.internalCostRate} + {formData.targetMarginPct}% margin
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        {formData.defaultCurrency === 'BRL' ? 'R$' : formData.defaultCurrency === 'USD' ? '$' : '€'} {suggestedRate}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={formData.defaultCurrency}
                  onValueChange={(val: Currency) => handleChange('defaultCurrency', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL (R$) - Brazilian Real</SelectItem>
                    <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default currency for new projects and reports
                </p>
              </div>
            </CardContent>
          </Card>

          {hasChanges && (
            <Card className="border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">You have unsaved changes</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <GitHubConnectionCard />

          <Card>
            <CardHeader>
              <CardTitle>More Integrations</CardTitle>
              <CardDescription>
                Additional integrations coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-8">
                <ul className="space-y-1">
                  <li>• Slack notifications</li>
                  <li>• Jira sync</li>
                  <li>• Linear import</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
