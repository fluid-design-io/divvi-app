import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BodyScrollView } from "~/components/core/body-scroll-view";
import { Button } from "~/components/nativewindui/Button";
import { Text } from "~/components/nativewindui/Text";

export default function AddExpense() {
    return (
        <>
            <StatusBar animated style="light" />
            <BodyScrollView className="flex-1">
                <Text>Add Expense</Text>
                <Button onPress={() => router.dismiss()}>
                    <Text>Done</Text>
                </Button>
            </BodyScrollView>
        </>
    )
}