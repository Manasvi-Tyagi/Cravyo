const cron = require('node-cron');
const config = require('../config');
const { reconcileInfrastructure } = require('../services/reconciliation.service');

let task;

function startInfrastructureSync() {
  if (task) return task;
  if (!cron.validate(config.syncCron)) throw new Error(`Invalid SYNC_CRON expression: ${config.syncCron}`);
  task = cron.schedule(config.syncCron, async () => {
    try {
      const result = await reconcileInfrastructure();
      console.log('[Infrastructure sync]', result);
    } catch (error) {
      console.error('[Infrastructure sync] failed:', error.message);
    }
  }, { noOverlap: true });
  console.log(`Infrastructure reconciliation scheduled: ${config.syncCron}`);
  return task;
}

function stopInfrastructureSync() {
  if (task) task.stop();
  task = null;
}

module.exports = { startInfrastructureSync, stopInfrastructureSync };
