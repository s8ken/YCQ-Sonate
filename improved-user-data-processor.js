/**
 * Improved User Data Processor
 * Implements all GPT-4 recommendations for better code quality
 */

// Original function (for comparison)
function processUserDataOriginal(users) {
    var results = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].age > 18) {
            results.push({
                name: users[i].name,
                email: users[i].email,
                isAdult: true
            });
        }
    }
    return results;
}

// Improved function implementing all GPT-4 recommendations
function processUserData(users) {
    // Input validation - check if users is an array
    if (!Array.isArray(users)) {
        throw new TypeError('Expected an array of users');
    }

    // Modern JavaScript approach using filter and map
    return users
        .filter(user => {
            // Validate user object structure and age property
            return typeof user === 'object' && 
                   user !== null && 
                   typeof user.age === 'number' && 
                   user.age > 18;
        })
        .map(user => ({
            name: user.name || 'Unknown',
            email: user.email || 'No email provided',
            isAdult: true
        }));
}

// Alternative implementation with additional error handling
function processUserDataRobust(users) {
    if (!Array.isArray(users)) {
        throw new TypeError('Expected an array of users');
    }

    const results = [];
    
    for (const user of users) {
        try {
            // Comprehensive validation
            if (typeof user !== 'object' || user === null) {
                console.warn('Skipping invalid user object:', user);
                continue;
            }

            if (typeof user.age !== 'number' || isNaN(user.age)) {
                console.warn('Skipping user with invalid age:', user);
                continue;
            }

            if (user.age > 18) {
                results.push({
                    name: user.name || 'Unknown',
                    email: user.email || 'No email provided',
                    isAdult: true,
                    originalAge: user.age // Keep original age for reference
                });
            }
        } catch (error) {
            console.error('Error processing user:', user, error);
            // Continue processing other users even if one fails
        }
    }

    return results;
}

// Async version for handling large datasets
async function processUserDataAsync(users, batchSize = 1000) {
    if (!Array.isArray(users)) {
        throw new TypeError('Expected an array of users');
    }

    const results = [];
    
    // Process in batches to avoid blocking the event loop
    for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        const batchResults = batch
            .filter(user => 
                typeof user === 'object' && 
                user !== null && 
                typeof user.age === 'number' && 
                user.age > 18
            )
            .map(user => ({
                name: user.name || 'Unknown',
                email: user.email || 'No email provided',
                isAdult: true
            }));
        
        results.push(...batchResults);
        
        // Yield control back to event loop
        if (i + batchSize < users.length) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    return results;
}

// TypeScript-style JSDoc for better IDE support
/**
 * Process user data and filter adults
 * @param {Array<{name: string, email: string, age: number}>} users - Array of user objects
 * @returns {Array<{name: string, email: string, isAdult: boolean}>} Filtered adult users
 * @throws {TypeError} When users is not an array
 */
function processUserDataWithDocs(users) {
    if (!Array.isArray(users)) {
        throw new TypeError('Expected an array of users');
    }

    return users
        .filter(user => 
            typeof user === 'object' && 
            user !== null && 
            typeof user.age === 'number' && 
            user.age > 18
        )
        .map(user => ({
            name: user.name || 'Unknown',
            email: user.email || 'No email provided',
            isAdult: true
        }));
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processUserData,
        processUserDataRobust,
        processUserDataAsync,
        processUserDataWithDocs,
        processUserDataOriginal // For comparison
    };
}

// Example usage and testing
if (typeof window === 'undefined') {
    // Node.js environment - run some tests
    console.log('Testing improved user data processor...');
    
    const testUsers = [
        { name: 'Alice', email: 'alice@example.com', age: 25 },
        { name: 'Bob', email: 'bob@example.com', age: 17 },
        { name: 'Charlie', email: 'charlie@example.com', age: 30 },
        { name: 'Diana', age: 22 }, // Missing email
        { email: 'eve@example.com', age: 19 }, // Missing name
        { name: 'Frank', email: 'frank@example.com' }, // Missing age
        null, // Invalid user
        { name: 'Grace', email: 'grace@example.com', age: 'twenty' } // Invalid age
    ];
    
    try {
        console.log('\nOriginal function result:');
        console.log(JSON.stringify(processUserDataOriginal(testUsers.filter(u => u)), null, 2));
        
        console.log('\nImproved function result:');
        console.log(JSON.stringify(processUserData(testUsers), null, 2));
        
        console.log('\nRobust function result:');
        console.log(JSON.stringify(processUserDataRobust(testUsers), null, 2));
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}