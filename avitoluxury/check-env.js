// Environment variables checker for SMS functionality
require('dotenv').config();

console.log('=== SMS Environment Variables Check ===\n');

const requiredVars = [
  'TWO_FACTOR_API_KEY',
  'TWOFACTOR_API_KEY', 
  'TWO_FACTOR_SENDER_ID',
  'TWO_FACTOR_TEMPLATE_NAME'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? '✓ Set' : '✗ Not set'}`);
  if (value) {
    console.log(`  Value: ${value.substring(0, 10)}...`);
  }
  console.log('');
});

console.log('=== Recommended Values ===');
console.log('TWO_FACTOR_SENDER_ID: AVITOS (or your approved sender ID)');
console.log('TWO_FACTOR_TEMPLATE_NAME: Avito delivery (for delivery notifications)');
console.log('TWO_FACTOR_TEMPLATE_NAME: Avito Orderrr (for order confirmations)');