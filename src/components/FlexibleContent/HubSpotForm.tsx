"use client";
import { useEffect, useRef, useState } from "react";

interface HubSpotFormProps {
    portalId?: string;
    formId?: string;
    region?: string;
    title?: string;
    page?: string;
    description?: string;
    className?: string;
    onFormReady?: () => void;
    onFormSubmit?: () => void;
    onFormSubmitted?: () => void;
    minHeight?: string;
}

export default function HubSpotForm({
    portalId = "2624857",
    formId = "61452c30-12dd-4372-a75a-0028d217d919",
    region = "na1",
    title,
    page,
    description,
    minHeight = "520px",
}: HubSpotFormProps) {
    // if(page==='get-a-quote'){
    //    formId = "0c89895f-8397-4dff-9e5c-7f5766fda717"
    // }
    const rootRef = useRef<HTMLDivElement>(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    // Only load the HubSpot embed once the form is about to enter the viewport.
    // The form sits below the fold, so this keeps its heavy 3rd-party script off
    // the main thread during initial load / the LCP window.
    useEffect(() => {
        if (shouldLoad) return;
        const el = rootRef.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") {
            setShouldLoad(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "300px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [shouldLoad]);

    useEffect(() => {
        if (!shouldLoad) return;
        const loadForm = () => {
            if (window.hbspt) {
                window.hbspt.forms.create({
                    region,
                    portalId,
                    formId,
                    target: "#hubspot-form-container",
                    cssClass: "fe-hubspot-form",
                    css: `
                        .hs-input {
                            width: 100% !important;
                            padding: 0.75rem 1rem !important;
                            border: none !important;
                            border-radius: 0.5rem !important;
                            font-size: 0.875rem !important;
                            background-color: #ffffff !important;
                            color: #020210 !important;
                            box-shadow: 0 0 0 1px #e2e8f0 !important;
                            outline: none !important;
                            transition: box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) !important;
                            box-sizing: border-box !important;
                        }
                        .hs-input::placeholder {
                            color: rgba(2, 2, 16, 0.4) !important;
                        }
                        .hs-input:focus {
                            outline: none !important;
                            box-shadow: 0 0 0 2px #13A89E !important;
                        }
                        textarea.hs-input {
                            min-height: 80px !important;
                            resize: vertical !important;
                        }
                        .hs-form-field {
                            margin-bottom: 0.75rem !important;
                        }
                        .hs-form-field label {
                            color: #374151 !important;
                            font-weight: 500 !important;
                            margin-bottom: 0.375rem !important;
                            display: block !important;
                            font-size: 1rem !important;
                        }
                        .hs-button {
                            background-color: #020210 !important;
                            color: #ffffff !important;
                            cursor: pointer !important;
                            display: inline-flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            line-height: 1 !important;
                            font-weight: 600 !important;
                            border-radius: 9999px !important;
                            padding: 1rem !important;
                            font-size: 0.875rem !important;
                            border: none !important;
                            transition: background-color 0.2s ease, transform 0.2s ease !important;
                            width: 100% !important;
                            margin-top: 1rem !important;
                        }
                        .hs-button:hover {
                            background-color: rgba(2, 2, 16, 0.85) !important;
                        }
                        .hs-button:active {
                            transform: scale(0.98) !important;
                        }
                        .hs-error-msgs, .hs-error-msg {
                            color: #ef4444 !important;
                            font-size: 13px !important;
                        }
                    `,
                });
            }
        };

        if (!window.hbspt) {
            const script = document.createElement("script");
            script.src = "https://js.hsforms.net/forms/embed/v2.js";
            script.async = true;
            script.onload = loadForm;
            document.body.appendChild(script);
        } else {
            loadForm();
        }
    }, [shouldLoad, portalId, formId, region]);

    return (
        <div ref={rootRef} className="min-w-0  p-6 sm:p-8 hs-custom ">
            {(title || description) && (
                <div>
                    {title && (
                        <h2 className="text-2xl font-bold my-4 text-[#020210] sm:text-3xl">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-lg my-2 text-gray-800">{description}</p>
                    )}
                </div>
            )}
            <div
                id="hubspot-form-container"
                className={`hubspot-form-wrapper w-full min-h-120`}
            >
                <style>
                    {`
                    .hubspot-form-wrapper .hs-form-field {
  margin-bottom: 0.75rem !important;
}

.hubspot-form-wrapper .hs-form-field label {
  color: #374151 !important;
  font-weight: 500 !important;
  margin-bottom: 0.375rem !important;
  display: block !important;
  font-size: 1rem !important;
}

.hubspot-form-wrapper .hs-input {
  width: 100% !important;
  padding: 0.75rem 1rem !important;
  border: none !important;
  border-radius: 0.5rem !important;
  font-size: 0.875rem !important;
  background-color: #ffffff !important;
  color: #020210 !important;
  box-shadow: 0 0 0 1px #e2e8f0 !important;
  outline: none !important;
  transition: box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-sizing: border-box !important;
}

.hubspot-form-wrapper .hs-input::placeholder {
  color: rgba(2, 2, 16, 0.4) !important;
}

.hubspot-form-wrapper .hs-input:focus {
  outline: none !important;
  box-shadow: 0 0 0 2px #13A89E !important;
}

.hubspot-form-wrapper textarea.hs-input {
  min-height: 80px !important;
  resize: vertical !important;
}

.hubspot-form-wrapper .hs-button {
  background-color: #020210 !important;
  color: #ffffff !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  font-weight: 600 !important;
  border-radius: 9999px !important;
  padding: 1rem !important;
  font-size: 0.875rem !important;
  border: none !important;
  transition: background-color 0.2s ease, transform 0.2s ease !important;
  width: 100% !important;
  margin-top: 1rem !important;
}

.hubspot-form-wrapper .hs-button:hover {
  background-color: rgba(2, 2, 16, 0.85) !important;
}

.hubspot-form-wrapper .hs-button:active {
  transform: scale(0.98) !important;
}

.hubspot-form-wrapper .hs-error-msgs,
.hubspot-form-wrapper .hs-error-msg,
.hubspot-form-wrapper [class*="error"] {
  color: #ef4444 !important;
  font-size: 13px !important;
}

@media (max-width: 640px) {
  .hubspot-form-wrapper .hs-form-field {
    margin-bottom: 0.875rem !important;
  }
  .hubspot-form-wrapper .hs-input {
    padding: 0.75rem !important;
    font-size: 0.9rem !important;
  }
  .hubspot-form-wrapper .hs-button {
    padding: 0.75rem 0.5rem !important;
  }
}

@media (min-width: 768px) {
  .hubspot-form-wrapper .hs-button {
    padding: 0.75rem 1rem !important;
  }
}
                    `}
                </style>

            </div>
        </div>
    );
}
