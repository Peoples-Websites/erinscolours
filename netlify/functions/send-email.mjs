// local development needs dotenv installation and import
// but even then it will break in school due to certificate issues
// to run from school, root dir:
// $env:NODE_EXTRA_CA_CERTS = "C:\Users\davisjc02\Desktop\DevPortable\exa-root-ca.cer"
// npx.cmd netlify functions:serve
// it's broken

// but it does work on Netlify

//import "dotenv/config";  // for elsewhere
                          // don't forget to install dotenv                             


import { Resend } from "resend";


// return a JSON response with the appropriate HTTP status
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", }, });
}

// Netlify Function entry point
export default async (request) => {

  // only accept POST requests
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    // check the declared request size before reading the body
    const contentLength = Number(request.headers.get("content-length") || 0);

    if (contentLength > 10_000) {
      return jsonResponse({ error: "Request too large." }, 413);
    }

    // read the raw request body and check its actual size
    const rawBody = await request.text();

    const bodySize = new TextEncoder().encode(rawBody).byteLength;

    if (bodySize > 10_000) {
      return jsonResponse({ error: "Request too large." }, 413);
    }

    // parse the submitted JSON
    let body;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "Invalid JSON." }, 400);
    }

    // check that the submitted fields are strings
    const { name, email, message, website } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      (website !== undefined && typeof website !== "string")
    ) {
      return jsonResponse({ error: "Invalid form submission." }, 400);
    }

    // trim whitespace from the submitted values
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    // honeypot: silently accept submissions made by bots
    if (website && website.trim() !== "") {
      return jsonResponse({ message: "Email sent successfully!", });
    }

    // basic validation
    if (
      !cleanName ||
      !cleanEmail ||
      !cleanMessage ||
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      cleanMessage.length > 5000
    ) {
      return jsonResponse({ error: "Please check the form fields." }, 400);
    }

    // validate the email address
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return jsonResponse({ error: "Please enter a valid email address." }, 400);
    }

    // check that the Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured.");
      return jsonResponse({ error: "Email service is not configured." }, 500);
    }

    // initialise Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // send the email
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "erinscolours@gmail.com",
      replyTo: cleanEmail,
      subject: "Website contact form message",
      text: `** Hey there you rock star, someone's sent you a message via the website! **

Name: ${cleanName}
Email: ${cleanEmail}

Message:
${cleanMessage}`,
    });

    // handle an error returned by Resend
    if (error) {
      console.error("Resend error:", error);
      return jsonResponse({ error: "The email provider could not send the email." }, 502);
    }

    // successful submission
    return jsonResponse({
      message: "Email sent successfully!",
      id: data.id,
    });

  } catch (error) {
    console.error("Contact form error:", error);

    return jsonResponse({ error: "An unexpected server error occurred." }, 500);
  }

};


// Netlify platform-level rate limiting
export const config = {
  path: "/.netlify/functions/send-email",

  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
