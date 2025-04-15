import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useHelperFlagsStore } from './helperFlagsStore';

// Example component showing how to use the helper flags store
export const OnboardingScreen = () => {
    // Get the flags and actions from the store
    const {
        hasSeenWelcome,
        hasCompletedOnboarding,
        setFlag,
        resetAllFlags
    } = useHelperFlagsStore();

    // Example of checking if user has seen welcome screen
    useEffect(() => {
        if (!hasSeenWelcome) {
            // Show welcome screen
            console.log('Showing welcome screen');
            // After user dismisses welcome screen
            setFlag('hasSeenWelcome');
        }
    }, [hasSeenWelcome, setFlag]);

    // Example of completing onboarding
    const handleCompleteOnboarding = () => {
        setFlag('hasCompletedOnboarding');
        // Navigate to main app
    };

    // Example of resetting all flags (for testing)
    const handleResetFlags = () => {
        resetAllFlags();
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Onboarding Screen</Text>

            <Text style={{ marginBottom: 10 }}>
                Welcome Screen Seen: {hasSeenWelcome ? 'Yes' : 'No'}
            </Text>

            <Text style={{ marginBottom: 20 }}>
                Onboarding Completed: {hasCompletedOnboarding ? 'Yes' : 'No'}
            </Text>

            <Button
                title="Complete Onboarding"
                onPress={handleCompleteOnboarding}
                disabled={hasCompletedOnboarding}
            />

            <View style={{ height: 20 }} />

            <Button
                title="Reset All Flags (Testing)"
                onPress={handleResetFlags}
            />
        </View>
    );
};

// Example of a tutorial component
export const ExpenseCreationTutorial = () => {
    const {
        hasSeenExpenseCreationTutorial,
        setFlag
    } = useHelperFlagsStore();

    // Only show tutorial if user hasn't seen it before
    if (hasSeenExpenseCreationTutorial) {
        return null;
    }

    const handleDismissTutorial = () => {
        setFlag('hasSeenExpenseCreationTutorial');
    };

    return (
        <View style={{ padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>How to Create an Expense</Text>
            <Text style={{ marginBottom: 15 }}>
                Tap the + button to add a new expense. Fill in the details and select how to split the cost.
            </Text>
            <Button title="Got it!" onPress={handleDismissTutorial} />
        </View>
    );
}; 