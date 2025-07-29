/**
 * Custom ESLint Rules for HELOC Accelerator
 * 
 * Exports all custom rules for the contrast validation plugin
 */

module.exports = {
  rules: {
    'contrast-validation': require('./contrast-validation')
  }
};