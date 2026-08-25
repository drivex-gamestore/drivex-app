import { captureEvent } from '@providers/PostHogProvider';
export function track(eventName, properties) {
  try {
    captureEvent(eventName, properties);
  } catch {}
}

export function trackContactFormSubmitted(properties) {
  track("contact_form_submitted", properties);
}

export function trackContactFormStarted() {
  track("contact_form_started");
}

export function trackBookingFlowStarted() {
  track("booking_flow_started");
}

export function trackBookingFlowCompleted(properties) {
  track("booking_flow_completed", properties);
}

export function trackBookingFlowNotQualified(properties) {
  track("booking_flow_not_qualified", properties);
}

export function trackCalBookingOpened() {
  track("cal_booking_opened");
}

export function trackPopupShown(properties) {
  track("promotional_popup_shown", properties);
}

export function trackPopupClicked(properties) {
  track("promotional_popup_clicked", properties);
}

export function trackPopupClosed(properties) {
  track("promotional_popup_closed", properties);
}

export function trackCaseStudyViewed(properties) {
  track("case_study_viewed", properties);
}

export function trackVideoPlayed(properties) {
  track("video_played", properties);
}

export function trackVideoCompleted(properties) {
  track("video_completed", properties);
}

export function trackCtaClicked(properties) {
  track("cta_clicked", properties);
}

export function trackExternalLinkClicked(properties) {
  track("external_link_clicked", properties);
}

export function trackNewsletterSubscribed() {
  track("newsletter_subscribed");
}

export function trackAuditFormSubmitted(properties) {
  track("audit_form_submitted", properties);
}