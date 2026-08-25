'use client';

import { useRef, useState, useActionState, startTransition, useEffect } from 'react';
import { createServerReference, callServer, findSourceMapURL } from 'react-server-dom-webpack/client';
import { cx } from '@lib/vendor';
import { useSpamPrevention } from '@features/newsletters/hooks/useSpamPrevention';
import { FormHoneypot } from '@features/newsletters/forms/FormHoneypot';
import { AnimatedButton } from '@features/animations/components/AnimatedButton';
import { Input } from '@components/ui/Input';

const subscribeToNewsletterAction = createServerReference(
  "60e79069d1ce8778aae0c5903d5d5a2a8a1a54a683",
  callServer,
  undefined,
  findSourceMapURL,
  "subscribeToNewsletter"
);

export function NewsletterForm({
  heading,
  description,
  buttonText,
  successMessage = "You're on the list.",
  buttonTheme = "dark",
  className
}) {
  const formRef = useRef(null);
  const { checkSpam, enhanceFormData, reset } = useSpamPrevention({ formRef });

  const [actionState, formAction, isPending] = useActionState(subscribeToNewsletterAction, {
    success: false,
    error: ""
  });
  
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    
    const form = formRef.current;
    if (!form) return;
    
    const spamResult = checkSpam(form);
    if (spamResult.isSpam) {
      setLocalError(spamResult.message);
      return;
    }
    
    const enhancedData = enhanceFormData(new FormData(form));
    startTransition(() => {
      formAction(enhancedData);
    });
  };

  useEffect(() => {
    if (actionState.success) {
      formRef.current?.reset();
      reset();
    }
  }, [actionState.success, reset]);

  if (actionState.success) {
    return (
      <div className={className}>
        {heading && (
          <p className="mb-8 font-medium text-body text-foreground">
            {heading}
          </p>
        )}
        <p className="text-body text-foreground-muted">
          {successMessage}
        </p>
      </div>
    );
  }

  const submitText = isPending ? "..." : (buttonText === undefined ? "Subscribe" : buttonText);

  return (
    <div className={className}>
      {heading && (
        <p className="mb-8 font-medium text-body text-foreground">
          {heading}
        </p>
      )}
      {description && (
        <p className="mb-16 text-body-sm text-foreground-muted">
          {description}
        </p>
      )}
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <Input 
            type="text" 
            name="name" 
            placeholder="Name" 
            required={true} 
            autoComplete="name" 
            size="sm" 
          />
          <Input 
            type="email" 
            name="email" 
            placeholder="Email" 
            required={true} 
            autoComplete="email" 
            size="sm" 
          />
          <AnimatedButton 
            type="submit" 
            disabled={isPending} 
            theme={buttonTheme} 
            size="sm" 
            className="w-full"
          >
            {submitText}
          </AnimatedButton>
        </div>
        
        <FormHoneypot />
        
        <p className="text-body-sm text-foreground-muted opacity-60">
          Unsubscribe anytime.
        </p>
        
        {(localError || (!actionState.success && actionState.error)) && (
          <p className={cx("text-body-sm", buttonTheme === "dark" ? "text-brand" : "text-red-500")}>
            {localError || actionState.error}
          </p>
        )}
      </form>
    </div>
  );
}
