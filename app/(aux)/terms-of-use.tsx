import { Link, Stack } from 'expo-router';
import { BodyScrollView } from '~/components/core/body-scroll-view';
import { Text } from '~/components/nativewindui/Text';

export default function TermsOfUse() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Terms of Use',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <BodyScrollView contentContainerClassName="gap-4 p-4 pb-12">
        <Text variant="title1">Terms of Use</Text>
        <Text variant="subhead">Effective Date: 2025-04-22</Text>

        <Text variant="body">
          Welcome to Divvi! These Terms of Use ("Terms") govern your access to and use of the Divvi
          mobile application (the "App") provided by Oliver Pan ("we," "us," or "our"). Please read
          these Terms carefully before using the App. Your use of the App also signifies your
          agreement to our <Link href="/(aux)/privacy-policy">Privacy Policy</Link>.
        </Text>

        <Text variant="heading">1. Acceptance of Terms</Text>
        <Text variant="body">
          By downloading, accessing, or using the App, you agree to be bound by these Terms. If you
          do not agree to these Terms, do not use the App.
        </Text>

        <Text variant="heading">2. Description of Service</Text>
        <Text variant="body">
          Divvi is a personal finance companion designed to help users manage their spending and
          saving habits. The App provides features for tracking expenses, setting budgets, and
          analyzing financial data.
        </Text>

        <Text variant="heading">3. User Accounts</Text>
        <Text variant="body">
          You may need to register for an account to access certain features of the App. You are
          responsible for maintaining the confidentiality of your account information and for all
          activities that occur under your account. You agree to notify us immediately of any
          unauthorized use of your account.
        </Text>

        <Text variant="heading">4. User Conduct</Text>
        <Text variant="body">
          You agree to use the App only for lawful purposes and in accordance with these Terms. You
          agree not to:
        </Text>
        <Text variant="body" className="pl-4">
          {`• Use the App in any way that violates any applicable federal, state, local, or international law or regulation.
• Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the App, or which, as determined by us, may harm us or users of the App or expose them to liability.
• Use the App in any manner that could disable, overburden, damage, or impair the App or interfere with any other party's use of the App.
• Use any robot, spider, or other automatic device, process, or means to access the App for any purpose, including monitoring or copying any of the material on the App.
• Introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful.`}
        </Text>

        <Text variant="heading">5. Intellectual Property</Text>
        <Text variant="body">
          The App and its entire contents, features, and functionality (including but not limited to
          all information, software, text, displays, images, video, and audio, and the design,
          selection, and arrangement thereof) are owned by Oliver Pan, its licensors, or other
          providers of such material and are protected by international copyright, trademark,
          patent, trade secret, and other intellectual property or proprietary rights laws.
        </Text>
        <Text variant="body">
          These Terms permit you to use the App for your personal, non-commercial use only. You must
          not reproduce, distribute, modify, create derivative works of, publicly display, publicly
          perform, republish, download, store, or transmit any of the material on our App, except as
          follows:
        </Text>
        <Text variant="body" className="pl-4">
          {`• Your device may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials.
• You may store files that are automatically cached by your device for display enhancement purposes.
• You may download a single copy of the mobile application to your own device solely for your own personal, non-commercial use, provided you agree to be bound by our end user license agreement for such applications.`}
        </Text>

        <Text variant="heading">6. Disclaimers</Text>
        <Text variant="body" color="secondary">
          THE APP IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY
          KIND, EITHER EXPRESS OR IMPLIED. NEITHER OLIVER PAN NOR ANY PERSON ASSOCIATED WITH OLIVER
          PAN MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY,
          RELIABILITY, QUALITY, ACCURACY, OR AVAILABILITY OF THE APP. WITHOUT LIMITING THE
          FOREGOING, NEITHER OLIVER PAN NOR ANYONE ASSOCIATED WITH OLIVER PAN REPRESENTS OR WARRANTS
          THAT THE APP, ITS CONTENT, OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE APP WILL BE
          ACCURATE, RELIABLE, ERROR-FREE, OR UNINTERRUPTED, THAT DEFECTS WILL BE CORRECTED, THAT OUR
          SITE OR THE SERVER THAT MAKES IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL
          COMPONENTS, OR THAT THE APP OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE APP WILL
          OTHERWISE MEET YOUR NEEDS OR EXPECTATIONS.
        </Text>
        <Text variant="body" color="secondary">
          TO THE FULLEST EXTENT PROVIDED BY LAW, WE HEREBY DISCLAIM ALL WARRANTIES OF ANY KIND,
          WHETHER EXPRESS OR IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY
          WARRANTIES OF MERCHANTABILITY, NON-INFRINGEMENT, AND FITNESS FOR PARTICULAR PURPOSE.
        </Text>
        <Text variant="caption1" color="tertiary">
          THE FOREGOING DOES NOT AFFECT ANY WARRANTIES THAT CANNOT BE EXCLUDED OR LIMITED UNDER
          APPLICABLE LAW.
        </Text>

        <Text variant="heading">7. Limitation on Liability</Text>
        <Text variant="body" color="secondary">
          TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO EVENT WILL OLIVER PAN, ITS AFFILIATES, OR
          THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE
          FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR
          USE, OR INABILITY TO USE, THE APP, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE APP OR
          SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL,
          OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, PERSONAL INJURY, PAIN AND SUFFERING,
          EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR ANTICIPATED
          SAVINGS, LOSS OF USE, LOSS OF GOODWILL, LOSS OF DATA, AND WHETHER CAUSED BY TORT
          (INCLUDING NEGLIGENCE), BREACH OF CONTRACT, OR OTHERWISE, EVEN IF FORESEEABLE.
        </Text>
        <Text variant="caption1" color="tertiary">
          THE FOREGOING DOES NOT AFFECT ANY LIABILITY THAT CANNOT BE EXCLUDED OR LIMITED UNDER
          APPLICABLE LAW.
        </Text>

        <Text variant="heading">8. Indemnification</Text>
        <Text variant="body">
          You agree to defend, indemnify, and hold harmless Oliver Pan, its affiliates, licensors,
          and service providers, and its and their respective officers, directors, employees,
          contractors, agents, licensors, suppliers, successors, and assigns from and against any
          claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees
          (including reasonable attorneys' fees) arising out of or relating to your violation of
          these Terms or your use of the App.
        </Text>

        <Text variant="heading">9. Governing Law and Jurisdiction</Text>
        <Text variant="body">
          All matters relating to the App and these Terms, and any dispute or claim arising
          therefrom or related thereto (in each case, including non-contractual disputes or claims),
          shall be governed by and construed in accordance with the internal laws of the State of
          Texas without giving effect to any choice or conflict of law provision or rule.
        </Text>
        <Text variant="body">
          Any legal suit, action, or proceeding arising out of, or related to, these Terms or the
          App shall be instituted exclusively in the federal courts or state courts located in Waco,
          Texas. You waive any and all objections to the exercise of jurisdiction over you by such
          courts and to venue in such courts.
        </Text>

        <Text variant="heading">10. Changes to Terms</Text>
        <Text variant="body">
          We may revise and update these Terms from time to time in our sole discretion. All changes
          are effective immediately when we post them. Your continued use of the App following the
          posting of revised Terms means that you accept and agree to the changes. You are expected
          to check this page frequently so you are aware of any changes, as they are binding on you.
        </Text>

        <Text variant="heading">11. Contact Information</Text>
        <Text variant="body">
          To ask questions or comment about these Terms of Use, contact us at:
        </Text>
        <Text variant="footnote" className="pl-4">
          Oliver Pan{'\n'}
          Email: <Link href="mailto:panjiuzhen@gmail.com">panjiuzhen@gmail.com</Link>
          {'\n'}
          Discord Support:{' '}
          <Link href="https://discord.com/channels/1361576485110153328/1364090705840181318">
            Discord
          </Link>
          {'\n'}
          Website: <Link href="https://divvi-app.uing.dev">Divvi</Link>
        </Text>

        <Text variant="body" className="pt-4">
          Thank you for using Divvi!
        </Text>
      </BodyScrollView>
    </>
  );
}
