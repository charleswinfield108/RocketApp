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
