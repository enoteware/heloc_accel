'use client'

import React from 'react'
import { CalculationInput } from '@/lib/types'
import { useCalculatorForm } from '@/hooks/useCalculatorForm'
import { CurrencyFieldWithTooltip, PercentageFieldWithTooltip, NumericFieldWithTooltip } from '@/components/form/FormFieldWithTooltip'
import { Button } from '@/components/design-system/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/Card'
import { Progress } from '@/components/design-system/Progress'

interface EnhancedCalculatorFormProps {
  onSubmit: (data: CalculationInput) => void | Promise<void>
  loading?: boolean
  initialData?: Partial<CalculationInput>
}

export default function EnhancedCalculatorForm({ 
  onSubmit, 
  loading = false, 
  initialData = {} 
}: EnhancedCalculatorFormProps) {
  const {
    register,
    handleSubmit,
    errors,
    isValid,
    touchedFields,
    validationRules,
    getFormProgress,
    setValue
  } = useCalculatorForm()

  const progress = getFormProgress()

  const handlePrefillDemo = () => {
    const demoData = {
      currentMortgageBalance: '$350,000',
      currentInterestRate: '6.5',
      remainingTermMonths: '300',
      monthlyPayment: '$2,347',
      helocLimit: '$100,000',
      helocInterestRate: '7.25',
      monthlyIncome: '$8,500',
      monthlyExpenses: '$3,900'
    }

    Object.entries(demoData).forEach(([field, value]) => {
      setValue(field as any, value, { shouldValidate: true, shouldTouch: true })
    })
  }

  const handleClearForm = () => {
    const emptyData = {
      currentMortgageBalance: '',
      currentInterestRate: '',
      remainingTermMonths: '',
      monthlyPayment: '',
      helocLimit: '',
      helocInterestRate: '',
      helocAvailableCredit: '',
      monthlyIncome: '',
      monthlyExpenses: '',
      monthlyDiscretionaryIncome: ''
    }

    Object.entries(emptyData).forEach(([field, value]) => {
      setValue(field as any, value, { shouldValidate: false, shouldTouch: false })
    })
  }

  return (
    <div className="space-y-6">
      {/* Form Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Form Progress</span>
            <span className="text-sm text-gray-500">{progress.completed}/{progress.total} fields</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Mortgage Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Current Mortgage Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CurrencyFieldWithTooltip
                name="currentMortgageBalance"
                label="Current Mortgage Balance *"
                register={register}
                errors={errors}
                rules={validationRules.currentMortgageBalance}
                placeholder="$350,000"
              />

              <PercentageFieldWithTooltip
                name="currentInterestRate"
                label="Current Interest Rate *"
                register={register}
                errors={errors}
                rules={validationRules.currentInterestRate}
                placeholder="6.5%"
              />

              <NumericFieldWithTooltip
                name="remainingTermMonths"
                label="Remaining Term (Months) *"
                register={register}
                errors={errors}
                rules={validationRules.remainingTermMonths}
                placeholder="300"
              />

              <CurrencyFieldWithTooltip
                name="monthlyPayment"
                label="Monthly Payment (P&I) *"
                register={register}
                errors={errors}
                rules={validationRules.monthlyPayment}
                placeholder="$2,347"
              />
            </div>
          </CardContent>
        </Card>

        {/* HELOC Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>HELOC Information (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CurrencyFieldWithTooltip
                name="helocLimit"
                label="HELOC Credit Limit"
                register={register}
                errors={errors}
                rules={validationRules.helocLimit}
                placeholder="$100,000"
              />

              <PercentageFieldWithTooltip
                name="helocInterestRate"
                label="HELOC Interest Rate"
                register={register}
                errors={errors}
                rules={validationRules.helocInterestRate}
                placeholder="7.25%"
              />

              <CurrencyFieldWithTooltip
                name="helocAvailableCredit"
                label="Available HELOC Credit"
                register={register}
                errors={errors}
                placeholder="$100,000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Income and Expenses Section */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income & Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CurrencyFieldWithTooltip
                name="monthlyIncome"
                label="Monthly Gross Income *"
                register={register}
                errors={errors}
                rules={validationRules.monthlyIncome}
                placeholder="$8,500"
              />

              <CurrencyFieldWithTooltip
                name="monthlyExpenses"
                label="Monthly Expenses *"
                register={register}
                errors={errors}
                rules={validationRules.monthlyExpenses}
                placeholder="$3,900"
              />

              <CurrencyFieldWithTooltip
                name="monthlyDiscretionaryIncome"
                label="Discretionary Income"
                register={register}
                errors={errors}
                rules={validationRules.monthlyDiscretionaryIncome}
                placeholder="Auto-calculated"
                disabled
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Discretionary Income</strong> is automatically calculated as: 
                Monthly Income - Monthly Expenses - Mortgage Payment. This amount will be used for HELOC acceleration.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={!isValid || loading}
                loading={loading}
                className="flex-1"
              >
                {loading ? 'Calculating...' : 'Calculate HELOC Acceleration'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handlePrefillDemo}
                disabled={loading}
              >
                Demo Data
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleClearForm}
                disabled={loading}
              >
                Clear Form
              </Button>
            </div>
            
            {!isValid && Object.keys(touchedFields).length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Please complete all required fields and fix any validation errors before calculating.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
