import Card from "../../components/ui/Card";

const PAGES = {
  About: {
    title: "About BookEasy ET",
    body: "BookEasy ET is a marketplace for discovering local businesses, booking barbershops and salons, and ordering restaurant food before standing in a queue. Payment is collected at the business during the pilot.",
  },
  Contact: {
    title: "Contact",
    body: "For pilot onboarding and support, email the platform team at support@bookeasy.et. Include your business name and the phone number on the account.",
  },
  Privacy: {
    title: "Privacy notice",
    body: "We store the name, email, phone, bookings and orders needed to run the service. Business staff can see the contact details for their own customers. We do not sell personal data. You can ask for account deletion by contacting support. This notice is a product summary, not a substitute for legal review under Ethiopian law before a commercial launch.",
  },
  Terms: {
    title: "Terms of use",
    body: "Bookings and orders are requests to a business. A restaurant confirms an order before it is accepted, unless that business has turned on automatic acceptance. Prices shown at checkout are calculated by the server. A table QR code only opens that table's menu. It does not grant access to the business dashboard. Offline orders are not accepted.",
  },
};

export default function InfoPage({ title }) {
  const page = PAGES[title] || PAGES.About;
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card className="p-8">
        <h1 className="text-3xl font-extrabold">{page.title}</h1>
        <p className="mt-4 leading-relaxed text-slate-600">{page.body}</p>
      </Card>
    </div>
  );
}
