# Budgeting Tool API Documentation

## Overview

This document describes the REST API endpoints for the Dynamic Mortgage Acceleration Budgeting Tool. All endpoints follow RESTful conventions and return JSON responses.

## Base URL

```
/api/budgeting
```

## Authentication

All endpoints require authentication via NextAuth.js session. Include the session token in requests.

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details",
    "field": "fieldName" // For validation errors
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Budget Scenarios

### GET /api/budgeting/scenarios

Get all budget scenarios for the authenticated user.

**Query Parameters:**

- `scenarioId` (optional) - Filter by parent scenario ID
- `active` (optional) - Filter by active status (true/false)
- `limit` (optional) - Limit number of results (default: 50)
- `offset` (optional) - Offset for pagination (default: 0)

**Response:**

```json
{
  "budgetScenarios": [
    {
      "id": "uuid",
      "scenarioId": "uuid",
      "name": "My Budget Scenario",
      "description": "Description of the scenario",
      "baseMonthlyGrossIncome": 8000.0,
      "baseMonthlyNetIncome": 6000.0,
      "baseMonthlyExpenses": 4000.0,
      "baseDiscretionaryIncome": 2000.0,
      "recommendedPrincipalPayment": 6000.0,
      "customPrincipalPayment": null,
      "principalMultiplier": 3.0,
      "autoAdjustPayments": true,
      "isActive": true,
      "createdAt": "2025-08-15T10:00:00Z",
      "updatedAt": "2025-08-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### POST /api/budgeting/scenarios

Create a new budget scenario.

**Request Body:**

```json
{
  "scenarioId": "uuid",
  "name": "My Budget Scenario",
  "description": "Optional description",
  "baseMonthlyGrossIncome": 8000.0,
  "baseMonthlyNetIncome": 6000.0,
  "baseMonthlyExpenses": 4000.0,
  "customPrincipalPayment": null,
  "principalMultiplier": 3.0,
  "autoAdjustPayments": true
}
```

**Response:** `201 Created`

```json
{
  "budgetScenario": {
    "id": "uuid",
    "scenarioId": "uuid",
    "name": "My Budget Scenario",
    "description": "Optional description",
    "baseMonthlyGrossIncome": 8000.0,
    "baseMonthlyNetIncome": 6000.0,
    "baseMonthlyExpenses": 4000.0,
    "baseDiscretionaryIncome": 2000.0,
    "recommendedPrincipalPayment": 6000.0,
    "customPrincipalPayment": null,
    "principalMultiplier": 3.0,
    "autoAdjustPayments": true,
    "isActive": true,
    "createdAt": "2025-08-15T10:00:00Z",
    "updatedAt": "2025-08-15T10:00:00Z"
  }
}
```

### GET /api/budgeting/scenarios/{id}

Get a specific budget scenario by ID.

**Response:**

```json
{
  "budgetScenario": {
    "id": "uuid",
    "scenarioId": "uuid",
    "name": "My Budget Scenario",
    "description": "Description",
    "baseMonthlyGrossIncome": 8000.0,
    "baseMonthlyNetIncome": 6000.0,
    "baseMonthlyExpenses": 4000.0,
    "baseDiscretionaryIncome": 2000.0,
    "recommendedPrincipalPayment": 6000.0,
    "customPrincipalPayment": null,
    "principalMultiplier": 3.0,
    "autoAdjustPayments": true,
    "isActive": true,
    "createdAt": "2025-08-15T10:00:00Z",
    "updatedAt": "2025-08-15T10:00:00Z",
    "incomeScenarios": [
      {
        "id": "uuid",
        "name": "Annual Raise",
        "scenarioType": "raise",
        "amount": 500.0,
        "startMonth": 13,
        "endMonth": null,
        "frequency": "monthly",
        "isActive": true
      }
    ],
    "expenseScenarios": [
      {
        "id": "uuid",
        "name": "Emergency Repair",
        "category": "emergency",
        "amount": 5000.0,
        "startMonth": 6,
        "endMonth": 6,
        "frequency": "one_time",
        "isActive": true
      }
    ]
  }
}
```

### PUT /api/budgeting/scenarios/{id}

Update an existing budget scenario.

**Request Body:** Same as POST request

**Response:** `200 OK` with updated budget scenario object

### DELETE /api/budgeting/scenarios/{id}

Delete a budget scenario and all associated data.

**Response:** `204 No Content`

## Income Scenarios

### GET /api/budgeting/scenarios/{budgetScenarioId}/income-scenarios

Get all income scenarios for a budget scenario.

**Response:**

```json
{
  "incomeScenarios": [
    {
      "id": "uuid",
      "budgetScenarioId": "uuid",
      "name": "Annual Raise",
      "description": "3% annual salary increase",
      "scenarioType": "raise",
      "amount": 500.0,
      "startMonth": 13,
      "endMonth": null,
      "frequency": "monthly",
      "isActive": true,
      "isRecurring": true,
      "taxRate": 0.25,
      "createdAt": "2025-08-15T10:00:00Z",
      "updatedAt": "2025-08-15T10:00:00Z"
    }
  ]
}
```

### POST /api/budgeting/scenarios/{budgetScenarioId}/income-scenarios

Create a new income scenario.

**Request Body:**

```json
{
  "name": "Annual Raise",
  "description": "3% annual salary increase",
  "scenarioType": "raise",
  "amount": 500.0,
  "startMonth": 13,
  "endMonth": null,
  "frequency": "monthly",
  "isRecurring": true,
  "taxRate": 0.25
}
```

**Response:** `201 Created` with income scenario object

### PUT /api/budgeting/income-scenarios/{id}

Update an existing income scenario.

### DELETE /api/budgeting/income-scenarios/{id}

Delete an income scenario.

## Expense Scenarios

### GET /api/budgeting/scenarios/{budgetScenarioId}/expense-scenarios

Get all expense scenarios for a budget scenario.

**Response:**

```json
{
  "expenseScenarios": [
    {
      "id": "uuid",
      "budgetScenarioId": "uuid",
      "name": "Emergency Repair",
      "description": "Unexpected home repair",
      "category": "emergency",
      "subcategory": "home_repair",
      "amount": 5000.0,
      "startMonth": 6,
      "endMonth": 6,
      "frequency": "one_time",
      "isActive": true,
      "isRecurring": false,
      "isEssential": true,
      "priorityLevel": 8,
      "createdAt": "2025-08-15T10:00:00Z",
      "updatedAt": "2025-08-15T10:00:00Z"
    }
  ]
}
```

### POST /api/budgeting/scenarios/{budgetScenarioId}/expense-scenarios

Create a new expense scenario.

**Request Body:**

```json
{
  "name": "Emergency Repair",
  "description": "Unexpected home repair",
  "category": "emergency",
  "subcategory": "home_repair",
  "amount": 5000.0,
  "startMonth": 6,
  "endMonth": 6,
  "frequency": "one_time",
  "isRecurring": false,
  "isEssential": true,
  "priorityLevel": 8
}
```

**Response:** `201 Created` with expense scenario object

### PUT /api/budgeting/expense-scenarios/{id}

Update an existing expense scenario.

### DELETE /api/budgeting/expense-scenarios/{id}

Delete an expense scenario.

## Calculations

### POST /api/budgeting/scenarios/{id}/calculate

Perform full calculation for a budget scenario.

**Request Body:**

```json
{
  "includeScenarios": ["income-scenario-id", "expense-scenario-id"],
  "monthsToProject": 360,
  "recalculateAll": false
}
```

**Response:**

```json
{
  "calculationId": "uuid",
  "budgetScenarioId": "uuid",
  "summary": {
    "totalMonths": 240,
    "totalInterestSaved": 125000.0,
    "pmiEliminationMonth": 48,
    "maxDiscretionaryIncome": 3500.0,
    "minDiscretionaryIncome": 1500.0,
    "averageDiscretionaryIncome": 2250.0,
    "traditionalPayoffMonths": 360,
    "budgetingPayoffMonths": 240,
    "monthsSaved": 120
  },
  "monthlyResults": [
    {
      "monthNumber": 1,
      "monthlyGrossIncome": 8000.0,
      "monthlyNetIncome": 6000.0,
      "monthlyExpenses": 4000.0,
      "discretionaryIncome": 2000.0,
      "recommendedPrincipalPayment": 6000.0,
      "actualPrincipalPayment": 6000.0,
      "beginningMortgageBalance": 300000.0,
      "endingMortgageBalance": 295000.0,
      "mortgagePayment": 1500.0,
      "mortgageInterest": 1000.0,
      "mortgagePrincipal": 500.0,
      "pmiPayment": 250.0,
      "currentLtv": 73.75,
      "pmiEliminated": false,
      "cumulativeInterestSaved": 0.0,
      "cumulativeTimeSavedMonths": 0
    }
  ]
}
```

### GET /api/budgeting/scenarios/{id}/results

Get cached calculation results for a budget scenario.

**Query Parameters:**

- `startMonth` (optional) - Start month for results
- `endMonth` (optional) - End month for results
- `summary` (optional) - Return only summary data (true/false)

### POST /api/budgeting/calculate-live

Perform real-time calculation without saving.

**Request Body:**

```json
{
  "baseIncome": 6000.0,
  "baseExpenses": 4000.0,
  "mortgageDetails": {
    "principal": 300000.0,
    "annualInterestRate": 0.04,
    "termInMonths": 360,
    "monthlyPayment": 1432.25,
    "propertyValue": 400000.0,
    "pmiMonthly": 250.0
  },
  "helocDetails": {
    "helocLimit": 50000.0,
    "helocRate": 0.045,
    "helocAvailableCredit": 50000.0
  },
  "scenarios": [
    {
      "type": "income",
      "amount": 500.0,
      "startMonth": 13,
      "frequency": "monthly"
    },
    {
      "type": "expense",
      "amount": 5000.0,
      "startMonth": 6,
      "frequency": "one_time"
    }
  ],
  "monthsToProject": 360,
  "principalMultiplier": 3.0
}
```

**Response:**

```json
{
  "discretionaryIncome": 2000.0,
  "recommendedPrincipalPayment": 6000.0,
  "projectedPayoffMonths": 240,
  "projectedInterestSaved": 125000.0,
  "pmiEliminationMonth": 48,
  "monthlyBreakdown": [
    {
      "monthNumber": 1,
      "discretionaryIncome": 2000.0,
      "principalPayment": 6000.0,
      "mortgageBalance": 295000.0,
      "interestSaved": 0.0
    }
  ]
}
```

## Templates

### GET /api/budgeting/templates

Get available budget scenario templates.

**Query Parameters:**

- `category` (optional) - Filter by template category
- `public` (optional) - Filter by public templates only (true/false)

**Response:**

```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Emergency Fund Depletion",
      "description": "Model the impact of using emergency funds",
      "category": "emergency",
      "incomeTemplate": [],
      "expenseTemplate": [
        {
          "category": "emergency",
          "amount": 5000,
          "frequency": "one_time",
          "startMonth": 1
        }
      ],
      "scenarioTemplate": {
        "description": "One-time emergency expense"
      },
      "isPublic": true,
      "usageCount": 45
    }
  ]
}
```

### POST /api/budgeting/scenarios/{id}/apply-template

Apply a template to an existing budget scenario.

**Request Body:**

```json
{
  "templateId": "uuid",
  "overrideExisting": false,
  "customizations": {
    "amount": 7500.0,
    "startMonth": 3
  }
}
```

## Validation

### POST /api/budgeting/validate

Validate budget scenario data without saving.

**Request Body:** Same as budget scenario creation request

**Response:**

```json
{
  "isValid": true,
  "errors": [],
  "warnings": [
    {
      "field": "baseMonthlyExpenses",
      "message": "Expenses seem high relative to income",
      "severity": "warning"
    }
  ],
  "suggestions": [
    {
      "field": "principalMultiplier",
      "message": "Consider increasing multiplier to 4.0 for faster payoff",
      "suggestedValue": 4.0
    }
  ]
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Standard endpoints**: 100 requests per minute per user
- **Calculation endpoints**: 20 requests per minute per user
- **Live calculation**: 5 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1692097200
```

## Webhooks (Future Enhancement)

Webhook endpoints for real-time updates:

- `calculation.completed` - Fired when calculation completes
- `scenario.updated` - Fired when scenario is modified
- `pmi.eliminated` - Fired when PMI elimination is projected

---

_This API documentation is version 1.0 and will be updated as features are added._
