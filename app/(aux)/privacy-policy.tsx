import { Link, Stack } from 'expo-router';
import { BodyScrollView } from '~/components/core/body-scroll-view';
import { Text } from '~/components/nativewindui/Text';

export default function PrivacyPolicy() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <BodyScrollView contentContainerClassName="gap-4 p-4 pb-12">
        <Text variant="title1">Privacy Policy</Text>
        <Text variant="subhead">Effective Date: 2025-04-22</Text>

        <Text variant="body">
          Welcome to Divvi! This Privacy Policy explains how Oliver Pan ("we," "us," or "our")
          handles information in connection with your use of the Divvi mobile application (the
          "App"). Your privacy is important to us, and we are committed to protecting it.
        </Text>

        <Text variant="heading">1. Information We Do Not Collect</Text>
        <Text variant="body">
          Currently, we do not collect any personal information or usage data through the App. We do
          not track your activity, financial information, or any other personal details.
        </Text>

        <Text variant="heading">2. Potential Future Data Collection</Text>
        <Text variant="body">
          In the future, we may collect anonymous usage data solely for the purpose of improving the
          App's performance and stability. This may include analytics related to app performance and
          crash rates. This data will be completely anonymous and cannot be used to identify you
          personally. We will update this Privacy Policy before implementing any such data
          collection.
        </Text>

        <Text variant="heading">3. Information Sharing and Selling</Text>
        <Text variant="body">
          We do not track your personal information, and therefore, we do not share or sell any
          personal data to third parties. Any potential future anonymous data collected will also
          not be shared or sold.
        </Text>

        <Text variant="heading">4. Data Access and Deletion</Text>
        <Text variant="body">
          As we do not currently collect personal data, there is no data to access or delete. Should
          we implement data collection in the future as described in Section 2, you will have the
          right to request an export or deletion of your data, where applicable. Instructions on how
          to make such requests will be provided in an updated version of this policy.
        </Text>

        <Text variant="heading">5. Children's Privacy</Text>
        <Text variant="body">
          The App is not intended for use by children under the age of 13. We do not knowingly
          collect any information from children under 13. If we learn that we have collected
          information from a child under 13, we will take steps to delete such information as soon
          as possible.
        </Text>

        <Text variant="heading">6. Changes to This Privacy Policy</Text>
        <Text variant="body">
          We may update this Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy within the App or on our website. You are advised to review
          this Privacy Policy periodically for any changes. Changes to this Privacy Policy are
          effective when they are posted.
        </Text>

        <Text variant="heading">7. Contact Information</Text>
        <Text variant="body">
          If you have any questions about this Privacy Policy, please contact us:
        </Text>
        <Text variant="footnote" className="pl-4">
          Oliver Pan{'\n'}
          Email: <Link href="mailto:panjiuzhen@gmail.com">panjiuzhen@gmail.com</Link>
        </Text>
      </BodyScrollView>
    </>
  );
}
