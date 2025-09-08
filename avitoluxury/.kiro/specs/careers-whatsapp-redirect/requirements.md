# Requirements Document

## Introduction

This feature modifies the "View Open Positions" button on the About Us page to redirect users to WhatsApp instead of a careers page. When users click the button, they will be taken directly to WhatsApp with the company's contact number (+919928200900) pre-loaded, allowing them to inquire about career opportunities directly.

## Requirements

### Requirement 1

**User Story:** As a potential job applicant visiting the About Us page, I want to click on "View Open Positions" and be redirected to WhatsApp, so that I can directly inquire about career opportunities with the company.

#### Acceptance Criteria

1. WHEN a user clicks the "View Open Positions" button THEN the system SHALL open WhatsApp with the phone number +919928200900
2. WHEN WhatsApp opens THEN the system SHALL pre-populate the chat with the company's contact number
3. WHEN the WhatsApp redirect occurs THEN the system SHALL open in a new tab/window to preserve the user's browsing session
4. IF WhatsApp is not installed on the user's device THEN the system SHALL open WhatsApp Web in the browser

### Requirement 2

**User Story:** As a user on any device (mobile/desktop), I want the WhatsApp redirect to work seamlessly, so that I can contact the company regardless of my platform.

#### Acceptance Criteria

1. WHEN a user clicks the button on a mobile device THEN the system SHALL attempt to open the WhatsApp mobile app first
2. IF the WhatsApp mobile app is not available THEN the system SHALL fallback to WhatsApp Web
3. WHEN a user clicks the button on a desktop device THEN the system SHALL open WhatsApp Web
4. WHEN the redirect occurs THEN the system SHALL maintain the current page state for the user

### Requirement 3

**User Story:** As a user, I want the button appearance and text to remain consistent with the current design, so that the user experience feels seamless and professional.

#### Acceptance Criteria

1. WHEN the button is displayed THEN the system SHALL maintain the current styling (black background, white text, hover effects)
2. WHEN the button is displayed THEN the system SHALL keep the current text "View Open Positions"
3. WHEN the button is displayed THEN the system SHALL maintain the arrow icon (FiArrowRight)
4. WHEN the button is hovered THEN the system SHALL show the same hover effect as before