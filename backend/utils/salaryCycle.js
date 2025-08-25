const DAYS_IN_CYCLE = 30;

/**
 * Check and update the driver's salary cycle if needed
 * @param {Object} driver - The driver document
 * @returns {Promise<Object>} Updated driver document
 */
const checkAndUpdateCycle = async (driver) => {
  const now = new Date();
  const lastUpdated = driver.currentCycle.lastUpdated || driver.registrationDate;
  
  // Calculate days since last update
  const daysSinceLastUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
  
  // If less than 30 days, no cycle update needed
  if (daysSinceLastUpdate < DAYS_IN_CYCLE) {
    return driver;
  }
  
  // Calculate how many full cycles have passed
  const cyclesPassed = Math.floor(daysSinceLastUpdate / DAYS_IN_CYCLE);
  
  if (cyclesPassed > 0) {
    // Complete the current cycle
    const currentCycleEnd = new Date(driver.currentCycle.startDate);
    currentCycleEnd.setDate(currentCycleEnd.getDate() + DAYS_IN_CYCLE);
    
    // Add current cycle to history
    driver.salaryCycles.push({
      cycleNumber: driver.currentCycle.cycleNumber,
      startDate: driver.currentCycle.startDate,
      endDate: currentCycleEnd,
      baseSalary: driver.currentCycle.baseSalary,
      totalAdvances: driver.currentCycle.currentAdvances,
      totalPaid: 0, // This would be updated when payment is made
      status: 'completed',
      transactions: []
    });
    
    // Calculate remaining balance to carry forward
    const remainingBalance = Math.max(0, driver.currentCycle.baseSalary - driver.currentCycle.currentAdvances);
    
    // Start new cycle
    const newCycleStart = new Date(currentCycleEnd);
    const newCycleEnd = new Date(newCycleStart);
    newCycleEnd.setDate(newCycleEnd.getDate() + DAYS_IN_CYCLE);
    
    driver.currentCycle = {
      cycleNumber: driver.currentCycle.cycleNumber + cyclesPassed,
      startDate: newCycleStart,
      baseSalary: remainingBalance, // Carry forward remaining balance
      currentAdvances: 0,
      lastUpdated: now
    };
    
    // Save the changes
    await driver.save();
  }
  
  return driver;
};

module.exports = {
  checkAndUpdateCycle,
  DAYS_IN_CYCLE
};
