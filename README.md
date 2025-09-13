# Request Blaster

A powerful tool for sending concurrent POST requests to a specified URL. It's designed for developers and testers who need to simulate high traffic, test server load capacity, or analyze API endpoint responses under stress. The application includes an AI-powered feature to intelligently learn server rate limits.

## Features

- **Concurrent Request Blasting**: Send a configurable number of POST requests simultaneously.
- **Customizable Payloads**: Easily configure the request URL, headers, cookies, and data payloads in JSON format.
- **Dynamic Data Injection**: Substitute placeholder values in your data payload, like a mobile number.
- **AI-Powered Rate Limiter**: An intelligent tool that analyzes server responses to learn about rate limits without manual configuration.
- **Visual Results**: A clear and responsive interface with a chart to visualize the success and failure rates of your request blasts.
- **Detailed Response View**: Inspect the status, status text, and body of each individual response.
- **Responsive Design**: A clean and modern UI that works seamlessly on both desktop and mobile devices.
- **Secure Input**: The target URL input is masked for privacy.

## How to Use

1.  **Configure Your Request**:
    -   Navigate to the **Configuration** tab.
    -   Enter the **Target URL** you want to send requests to. This field is masked for security.
    -   Provide a **Mobile Number** which will dynamically replace the `YOUR_MOBILE_NUMBER` placeholder in the data payload.
    -   Set the **Number of Requests** you want to send in a single blast.
    -   Expand the **Advanced Payload Customization** section to edit the `Headers`, `Cookies`, and `Data Payload` in JSON format.

2.  **Analyze Rate Limits (Optional)**:
    -   Before sending a full blast, you can use the AI to learn about the server's rate limits.
    -   Click the **Analyze Rate Limit** button.
    -   The AI will perform an analysis and display the results in the **AI Rate Limiter** tab, showing information like `Max Requests/Minute` and `Retry After`.

3.  **Blast Requests**:
    -   Once you are satisfied with your configuration, click the **Blast Requests** button.
    -   The application will send the configured number of requests concurrently.

4.  **View Results**:
    -   After the blast is complete, the application will automatically switch to the **Results** tab.
    -   You will see a visual summary chart of the request outcomes (Success, Client Error, Server Error).
    -   Below the chart, you can find a detailed list of each request. You can expand each item to view the response body.

## Tech Stack

-   **Frontend**: Next.js, React, TypeScript
-   **UI**: ShadCN UI, Tailwind CSS
-   **AI**: Google Gemini (via Genkit)
-   **Forms**: React Hook Form, Zod for validation
-   **Charts**: Recharts

## Developed By

**Mohammad Sheikh Shahinur Rahman**

*Software Engineer | CTO | DevOps Architect | Entrepreneur | Independent & Literary Researcher | Writer & Poet*
