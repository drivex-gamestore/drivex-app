
'use client';

import { useState, useMemo } from 'react';
import { AnimatedButton } from '@animations/components/AnimatedButton';
import { FormHoneypot } from '@features/newsletters/forms/FormHoneypot';
import { useSpamPrevention } from '@features/newsletters/hooks/useSpamPrevention';

const budgetOptions = [
  { value: "", label: "budget range *" },
  { value: "8-15k", label: "8-15k EUR/month" },
  { value: "15-25k", label: "15-25k EUR/month" },
  { value: "25k-plus", label: "25k+ EUR" }
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = "w-full border-0 border-b border-foreground/20 bg-transparent px-0 py-12 text-body text-foreground placeholder:text-foreground/40 focus:border-foreground focus:outline-none transition-colors";


export function ContactFormClient() {
  const { checkSpam, enhanceFormData } = useSpamPrevention();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    budget: "",
    message: ""
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("idle");
  const [spamError, setSpamError] = useState(null);

  const isFormValid = useMemo(() => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      emailRegex.test(formData.email) &&
      formData.budget !== "" &&
      formData.message.trim() !== ""
    );
  }, [formData]);

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return value.trim() === "" ? "First name is required" : undefined;
      case "lastName":
        return value.trim() === "" ? "Last name is required" : undefined;
      case "email":
        if (value.trim() === "") return "Email is required";
        if (!emailRegex.test(value)) return "Please enter a valid email";
        return undefined;
      case "budget":
        return value === "" ? "Please select a budget range" : undefined;
      case "message":
        return value.trim() === "" ? "Please tell us about your project" : undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentErrors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      budget: validateField("budget", formData.budget),
      message: validateField("message", formData.message)
    };

    setErrors(currentErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      budget: true,
      message: true
    });

    if (Object.values(currentErrors).some((err) => err !== undefined)) {
      return;
    }

    const formElement = e.target;
    const spamCheckResult = checkSpam(formElement);

    if (spamCheckResult.isSpam) {
      setSpamError(spamCheckResult.message);
      return;
    }

    setSpamError(null);
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const formDataObj = new FormData(formElement);
      const enhancedData = enhanceFormData(formDataObj);
      
      const response = await fetch("/api/contact", {
        method: "POST",
        body: enhancedData
      });

      if (response.ok) {
        setStatus("success");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          company: "",
          budget: "",
          message: ""
        });
        setTouched({});
        setErrors({});
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col gap-16">
        <p className="text-accent-sm text-brand">Message sent</p>
        <h3 className="text-h4">Thank you for reaching out</h3>
        <p className="text-body text-foreground/60">
          We'll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-24">
      <FormHoneypot />
      
      {spamError && (
        <div className="text-body-sm text-brand">{spamError}</div>
      )}

      <div className="grid grid-cols-1 gap-24 md:grid-cols-2">
        <div className="relative">
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="First Name*"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${inputClass} ${touched.firstName && errors.firstName ? "border-red-500" : ""}`}
          />
          {touched.firstName && errors.firstName && (
            <p className="absolute top-full mt-4 text-body-sm text-brand">
              {errors.firstName}
            </p>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Last Name*"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${inputClass} ${touched.lastName && errors.lastName ? "border-red-500" : ""}`}
          />
          {touched.lastName && errors.lastName && (
            <p className="absolute top-full mt-4 text-body-sm text-brand">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-24 md:grid-cols-2">
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email*"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${inputClass} ${touched.email && errors.email ? "border-red-500" : ""}`}
          />
          {touched.email && errors.email && (
            <p className="absolute top-full mt-4 text-body-sm text-brand">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <input
            type="text"
            id="company"
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="relative">
        <select
          id="budget"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${inputClass} cursor-pointer appearance-none ${touched.budget && errors.budget ? "border-red-500" : ""} ${formData.budget === "" ? "text-foreground/40" : ""}`}
        >
          {budgetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute top-1/2 right-0 size-16 -translate-y-1/2 text-foreground/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        {touched.budget && errors.budget && (
          <p className="absolute top-full mt-4 text-body-sm text-brand">
            {errors.budget}
          </p>
        )}
      </div>

      <div className="relative">
        <textarea
          id="message"
          name="message"
          placeholder="Tell us more about what you need*"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={5}
          className={`${inputClass} resize-none ${touched.message && errors.message ? "border-red-500" : ""}`}
        />
        {touched.message && errors.message && (
          <p className="absolute top-full mt-4 text-body-sm text-brand">
            {errors.message}
          </p>
        )}
      </div>

      <AnimatedButton
        type="submit"
        disabled={!isFormValid || isSubmitting}
        theme="brand"
        className="mt-16 w-full"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </AnimatedButton>

      {status === "error" && (
        <p className="text-body-sm text-brand">
          Failed to send message. Please try again.
        </p>
      )}
    </form>
  );
}