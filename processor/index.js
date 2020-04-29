'use strict';

const WorkTime = 5 * 1000; // 5 seconds

const main = async (body) => {
  console.log(`Execution ID: ${process.env.EXECUTION_ID}`);
  console.log('Processing...');

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Completed');
      resolve();
    }, WorkTime);
  });
};

(async () => {
  try {
    await main(process.env.BODY);
  } catch (e) {
    console.log(`Error: ${e}`);
    process.exit(1);
  }
})();
