# Research Notes

## Twilio SMS Integration in a Java Spring Boot Backend

### Overview

Twilio is a cloud communications platform that provides APIs for sending SMS messages, making voice calls, and more. In RocketFood, Twilio is used to send an SMS confirmation to the customer when an order is placed.

**Proof of account:** See [screenshots/twilio-account.png](screenshots/twilio-account.png)

---

### Step 1 — Create a Twilio Account

1. Go to [https://www.twilio.com](https://www.twilio.com) and sign up for a free trial account.
2. Verify your email address and a personal phone number (Twilio requires this for trial accounts).
3. Once logged in, your **Account Dashboard** displays your credentials.

---

### Step 2 — Locate Your Credentials

From the Twilio Console ([https://console.twilio.com](https://console.twilio.com)):

- **Account SID** — Found on the Account Dashboard under "Account Info". Starts with `AC`.
- **Auth Token** — Found directly below the Account SID. Click the eye icon to reveal it. Treat this like a password — never commit it to version control.

---

### Step 3 — Get a Twilio Phone Number

1. In the Twilio Console, go to **Phone Numbers → Manage → Buy a Number**.
2. Filter by SMS capability and select a number.
3. On a free trial, you can only send SMS to **verified** phone numbers. To verify a number, go to **Verified Caller IDs** in the console.

---

### Step 4 — Add the Twilio Dependency to Your Java Project

In `pom.xml`, add the Twilio SDK:

```xml
<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>10.1.5</version>
</dependency>
```

---

### Step 5 — Configure Credentials in `application.properties`

**Never hardcode credentials.** Store them in `application.properties` and reference them via `@Value`:

```properties
# Twilio SMS
twilio.account-sid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
twilio.auth-token=your_auth_token_here
twilio.from-number=+15551234567
```

Add `application.properties` to `.gitignore` or use environment variables in production:

```properties
twilio.account-sid=${TWILIO_ACCOUNT_SID}
twilio.auth-token=${TWILIO_AUTH_TOKEN}
twilio.from-number=${TWILIO_FROM_NUMBER}
```

---

### Step 6 — Initialize Twilio and Send SMS in Java

Inject the credentials using `@Value` and initialize the Twilio client with `@PostConstruct`:

```java
@Service
public class NotificationService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.from-number}")
    private String fromNumber;

    @PostConstruct
    public void initTwilio() {
        Twilio.init(accountSid, authToken);
    }

    public void sendSms(String toPhone, String messageBody) {
        Message.creator(
            new PhoneNumber(toPhone),
            new PhoneNumber(fromNumber),
            messageBody
        ).create();
    }
}
```

> `@PostConstruct` runs once after Spring injects all `@Value` fields, ensuring Twilio is initialized before any method calls it.

---

### How It Works in RocketFood

In this project, `NotificationService.sendSms()` is called when a new order is created with `send_sms: true` in the request body. The service:

1. Reads the customer's phone number from the database
2. Prepends `+1` if no country code is present
3. Sends a confirmation message: `"Your RocketFood order #<id> has been received!"`

The integration is guarded — if the Twilio credentials are blank in `application.properties`, the `@PostConstruct` skips initialization and the SMS is silently skipped rather than crashing the server.

---

### Security Notes

- **Never commit your Auth Token** to version control. Use `.gitignore` or environment variables.
- The `.env.example` file in this project documents required variables without exposing real values.
- On a Twilio trial account, SMS can only be sent to verified phone numbers. Upgrade to a paid account to send to any number.

---

## Notify.EU Email Integration in a Java Spring Boot Backend

### Overview

Notify.EU is a multi-channel notification platform that provides a REST API for sending transactional emails via SMTP channels. In RocketFood, Notify.EU is used to send an order confirmation email to the customer when an order is placed.

**Proof of account:** See [screenshots/notify-eu-account.png](screenshots/notify-eu-account.png)

---

### Step 1 — Create a Notify.EU Account

1. Go to [https://www.notify.eu](https://www.notify.eu) and register for an account.
2. Verify your email address and log in to the dashboard.
3. Once logged in, navigate to **Settings → API Credentials** to find your Client ID and Secret Key.

---

### Step 2 — Locate Your Credentials

From the Notify.EU dashboard:

- **Client ID** — Sent in the `X-ClientId` header of every API request.
- **Secret Key** — Sent in the `X-SecretKey` header. Treat this like a password — never commit it to version control.

---

### Step 3 — Configure an SMTP Channel

Notify.EU sends emails through a configured SMTP channel (e.g., Gmail, Outlook):

1. In the dashboard, go to **Channels → Add Channel → SMTP**.
2. For Gmail, use:
   - **Server:** `smtp.gmail.com`
   - **Port:** `587`
   - **User:** your Gmail address
   - **Password:** a Gmail App Password (not your regular password — see below)
3. To generate a Gmail App Password:
   - Go to your Google Account → Security → 2-Step Verification (must be enabled)
   - Search for "App passwords" → create one for "Mail" → copy the 16-character password
   - Use this as the SMTP password in Notify.EU

---

### Step 4 — Create a Notification Template

1. In the Notify.EU dashboard, go to **Templates → Create Template**.
2. Design your email template using dynamic parameters (e.g., `{{firstName}}`, `{{order_id}}`).
3. Note the **Notification Type Name** — this is the `notificationType` value used in API requests.

---

### Step 5 — Configure Credentials in `application.properties`

```properties
# Notify.EU Email
notify.api-url=https://api.notify.eu/notification/send
notify.client-id=your-client-id
notify.secret-key=your-secret-key
notify.template-id=your-notification-type-name
notify.language=en
```

Use environment variables in production:

```properties
notify.client-id=${NOTIFY_CLIENT_ID}
notify.secret-key=${NOTIFY_SECRET_KEY}
notify.template-id=${NOTIFY_TEMPLATE_ID}
```

---

### Step 6 — Send Email via the Notify.EU REST API in Java

Inject credentials with `@Value` and use `RestTemplate` to POST to the API:

```java
@Service
public class NotificationService {

    @Value("${notify.api-url}")
    private String notifyApiUrl;

    @Value("${notify.client-id}")
    private String clientId;

    @Value("${notify.secret-key}")
    private String secretKey;

    @Value("${notify.template-id}")
    private String templateId;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEmail(String toEmail, String recipientName, String orderId) {
        String body = "{"
            + "\"message\": {"
            + "  \"notificationType\": \"" + templateId + "\","
            + "  \"language\": \"en\","
            + "  \"params\": {"
            + "    \"firstName\": \"" + recipientName + "\","
            + "    \"order_id\": \"" + orderId + "\""
            + "  },"
            + "  \"transport\": [{"
            + "    \"type\": \"SMTP\","
            + "    \"recipients\": {"
            + "      \"to\": [{"
            + "        \"name\": \"" + recipientName + "\","
            + "        \"recipient\": \"" + toEmail + "\""
            + "      }]"
            + "    }"
            + "  }]"
            + "}"
            + "}";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-ClientId", clientId);
        headers.set("X-SecretKey", secretKey);

        restTemplate.postForEntity(notifyApiUrl, new HttpEntity<>(body, headers), String.class);
    }
}
```

---

### How It Works in RocketFood

`NotificationService.sendEmail()` is called when a new order is created with `send_email: true` in the request body. The service:

1. Resolves the customer's email from the database (falls back to the linked user's email)
2. Builds a JSON payload with the order details and customer name
3. Sets `X-ClientId` and `X-SecretKey` headers and POSTs to the Notify.EU API
4. The API routes the message through the configured SMTP channel to the customer's inbox

The integration is guarded — if `notify.client-id` or `notify.secret-key` are blank in `application.properties`, the email is skipped with a warning log rather than throwing an exception.

---

### Security Notes

- **Never commit your Secret Key** to version control.
- Store credentials as environment variables in staging and production environments.
- The `application.properties` file is listed in `.gitignore` to prevent accidental credential exposure.
