import mongoose from 'mongoose';





// Function to check if a specific user is subscribed
const checkSubscriptionForUser = async (username) => {
  console.log(`Checking subscription status for user: ${username}`);

  try {
    
    // Find the user by name (or any other criteria)
    const user = await User.findOne({ name: username });

    if (!user) {
      console.log(`User ${username} not found.`);
    } else if (user.subscribe) {
      console.log(`${username} is subscribed.`);
    } else {
      console.log(`${username} is not subscribed.`);
      // Perform additional actions, e.g., send a reminder
    }

    // Close the database connection
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error while checking subscription:", error);
  }
};

// Export the function
export default checkSubscriptionForUser;
