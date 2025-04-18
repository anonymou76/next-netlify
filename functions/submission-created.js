exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const data = JSON.parse(event.body);
  console.log('📨 Form submission received:', data);
  console.log('Context information:', context);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'OK' }),
  };
};
