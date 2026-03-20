const { StudentController } = require('./src/controllers/student.controller');
const db = require('./src/db/config.db').default;

async function test() {
  const req = {
    body: {
      decode: { id: 3 } // hvviet@gmail.com
    }
  };

  const res = {
    status: function(s) { 
      this.statusCode = s; 
      return this; 
    },
    json: function(j) { 
      console.log('STATUS:', this.statusCode);
      console.log('RESPONSE:', JSON.stringify(j, null, 2));
    }
  };

  try {
    await StudentController.getMyFees(req, res);
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await db.destroy();
  }
}

test();
