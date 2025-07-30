#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

/**
 * Free translation using MyMemory API (no API key required)
 * Limit: 100 requests/day for anonymous use, 1000 words per request
 */
async function translateText(text, targetLang = 'es') {
  return new Promise((resolve, reject) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.responseStatus === 200) {
            resolve(result.responseData.translatedText);
          } else {
            reject(new Error(`Translation failed: ${result.responseStatus}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Batch translate with rate limiting
 */
async function batchTranslate(strings, targetLang = 'es', batchSize = 10) {
  const results = {};
  const batches = [];
  
  // Split into batches
  for (let i = 0; i < strings.length; i += batchSize) {
    batches.push(strings.slice(i, i + batchSize));
  }
  
  console.log(`🔄 Translating ${strings.length} strings in ${batches.length} batches...`);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`📦 Processing batch ${i + 1}/${batches.length}`);
    
    const promises = batch.map(async (text, index) => {
      try {
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, index * 500));
        const translation = await translateText(text, targetLang);
        return { text, translation };
      } catch (error) {
        console.warn(`⚠️  Failed to translate: "${text}" - ${error.message}`);
        return { text, translation: text }; // Fallback to original
      }
    });
    
    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ text, translation }) => {
      results[text] = translation;
    });
    
    // Longer delay between batches
    if (i < batches.length - 1) {
      console.log('⏱️  Waiting 3 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  return results;
}

/**
 * Manual translations for key financial terms
 */
const manualTranslations = {
  'HELOC': 'HELOC', // Keep as is - commonly used term
  'HELOC Accelerator': 'Acelerador HELOC',
  'Mortgage': 'Hipoteca',
  'Property Value': 'Valor de la Propiedad',
  'Interest Rate': 'Tasa de Interés',
  'Monthly Payment': 'Pago Mensual',
  'Loan Balance': 'Saldo del Préstamo',
  'Principal': 'Capital',
  'PMI': 'PMI', // Keep abbreviation
  'LTV': 'LTV', // Keep abbreviation
  'Loan-to-Value': 'Préstamo a Valor',
  'Calculate': 'Calcular',
  'Calculator': 'Calculadora',
  'Dashboard': 'Panel de Control',
  'Scenarios': 'Escenarios',
  'Traditional Payoff': 'Pago Tradicional',
  'HELOC Acceleration': 'Aceleración HELOC',
  'Total Interest': 'Interés Total',
  'Time Saved': 'Tiempo Ahorrado',
  'Monthly Savings': 'Ahorros Mensuales',
  'Total Savings': 'Ahorros Totales',
  'Sign In': 'Iniciar Sesión',
  'Sign Out': 'Cerrar Sesión',
  'Loading...': 'Cargando...',
  'Save': 'Guardar',
  'Cancel': 'Cancelar',
  'Edit': 'Editar',
  'Delete': 'Eliminar',
  'Close': 'Cerrar',
  'Error': 'Error',
  'Success': 'Éxito',
  'This field is required': 'Este campo es obligatorio',
  'Invalid format': 'Formato inválido',
  'Must be positive number': 'Debe ser un número positivo',
};

async function main() {
  try {
    // Load user strings
    const userStrings = JSON.parse(fs.readFileSync('./user-strings.json', 'utf8'));
    
    console.log(`🌍 Starting free translation of ${userStrings.length} strings to Spanish`);
    console.log('📋 Using manual translations for financial terms...');
    
    const translations = { ...manualTranslations };
    
    // Filter out strings we already have manual translations for
    const needTranslation = userStrings.filter(str => !translations[str]);
    
    console.log(`🤖 Auto-translating ${needTranslation.length} remaining strings...`);
    
    if (needTranslation.length > 0) {
      const autoTranslations = await batchTranslate(needTranslation, 'es', 5);
      Object.assign(translations, autoTranslations);
    }
    
    // Create the final Spanish message file
    const spanishMessages = {
      navigation: {
        calculator: translations['Calculator'] || 'Calculadora',
        scenarios: translations['Scenarios'] || 'Escenarios', 
        reports: translations['Reports'] || 'Reportes',
        dashboard: translations['Dashboard'] || 'Panel de Control',
        signIn: translations['Sign In'] || 'Iniciar Sesión',
        signOut: translations['Sign Out'] || 'Cerrar Sesión',
        profile: translations['Profile'] || 'Perfil',
        language: translations['Language'] || 'Idioma'
      },
      calculator: {
        title: translations['HELOC Accelerator'] || 'Acelerador HELOC',
        subtitle: 'Compare estrategias de pago hipotecario tradicional vs aceleración HELOC',
        currentMortgage: translations['Current Mortgage'] || 'Hipoteca Actual',
        balance: translations['Balance'] || 'Saldo',
        interestRate: translations['Interest Rate'] || 'Tasa de Interés',
        monthlyPayment: translations['Monthly Payment'] || 'Pago Mensual',
        propertyValue: translations['Property Value'] || 'Valor de la Propiedad',
        calculate: translations['Calculate'] || 'Calcular',
        calculating: translations['Calculating'] || 'Calculando...'
      },
      results: {
        title: translations['Results'] || 'Resultados',
        traditional: translations['Traditional Payoff'] || 'Pago Tradicional',
        helocAcceleration: translations['HELOC Acceleration'] || 'Aceleración HELOC',
        totalInterest: translations['Total Interest'] || 'Interés Total',
        timeSaved: translations['Time Saved'] || 'Tiempo Ahorrado',
        monthlySavings: translations['Monthly Savings'] || 'Ahorros Mensuales',
        totalSavings: translations['Total Savings'] || 'Ahorros Totales'
      },
      validation: {
        required: translations['This field is required'] || 'Este campo es obligatorio',
        positive: translations['Must be positive number'] || 'Debe ser un número positivo',
        invalidFormat: translations['Invalid format'] || 'Formato inválido'
      },
      common: {
        save: translations['Save'] || 'Guardar',
        cancel: translations['Cancel'] || 'Cancelar',
        edit: translations['Edit'] || 'Editar',
        delete: translations['Delete'] || 'Eliminar',
        loading: translations['Loading...'] || 'Cargando...',
        error: translations['Error'] || 'Error',
        success: translations['Success'] || 'Éxito',
        close: translations['Close'] || 'Cerrar'
      }
    };
    
    // Save Spanish messages
    fs.writeFileSync('./src/messages/es.json', JSON.stringify(spanishMessages, null, 2));
    
    // Save full translation map for reference
    fs.writeFileSync('./translation-map.json', JSON.stringify(translations, null, 2));
    
    console.log('✅ Spanish translations complete!');
    console.log('📁 Updated src/messages/es.json');
    console.log('📋 Saved translation map to translation-map.json');
    console.log(`\n📊 Translation Summary:`);
    console.log(`   Manual translations: ${Object.keys(manualTranslations).length}`);
    console.log(`   Auto translations: ${needTranslation.length}`);
    console.log(`   Total strings: ${Object.keys(translations).length}`);
    
  } catch (error) {
    console.error('❌ Translation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}