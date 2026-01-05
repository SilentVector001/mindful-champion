const bcrypt = require('bcryptjs');

const storedHash = '$2a$10$RcoYq1p1dgipU4KFUULzveeBRU5OaN8WnGgjR0bXKQ.TJSbQ5FStm';
const passwordToTest = 'MindfulChampion2025!';

async function verifyPassword() {
  try {
    const isMatch = await bcrypt.compare(passwordToTest, storedHash);
    console.log('Password matches:', isMatch);
    
    if (!isMatch) {
      console.log('\nGenerating new hash for the password...');
      const newHash = await bcrypt.hash(passwordToTest, 10);
      console.log('New hash:', newHash);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyPassword();
